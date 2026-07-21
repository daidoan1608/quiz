package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ImportPreviewResponse;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.AuditLogRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.ExamQuestionRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamQuestionRepository;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private static final int MIN_ANSWERS = 2;
    private static final int MAX_ANSWERS = 8;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ChapterRepository chapterRepository;
    private final ModelMapper modelMapper;
    private final QuestionImportService questionImportService;
    private final QuestionMapper questionMapper;
    private final SoftDeleteService softDeleteService;
    private final AuditLogRepository auditLogRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final UserExamQuestionRepository userExamQuestionRepository;

    @Override
    public Optional<QuestionDto> getQuestionById(Long questionId) {
        return questionRepository.findByQuestionIdAndDeletedFalse(questionId)
                .map(question -> questionMapper.toDto(question));
    }

    @Override
    public List<QuestionDto> getQuestionsByChapterId(Long chapterId) {
        return questionRepository.findByChapter(chapterId).stream().map(question -> questionMapper.toDto(question)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            value = "practiceQuestions",
            key = "#chapterId + ':' + (#limit == null ? 'default' : #limit) + ':' + (#difficulty == null ? 'ALL' : #difficulty)",
            condition = "#mode == null || !#mode.equalsIgnoreCase('wrong')"
    )
    public List<QuestionDto> getPracticeQuestionsByChapter(Long chapterId, Integer limit, String difficulty, String mode, UUID userId) {
        int safeLimit = limit == null || limit <= 0 ? 50 : Math.min(limit, 100);
        String normalizedDifficulty = difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty)
                ? null
                : questionMapper.parseDifficulty(difficulty).name();

        List<Question> questions = questionRepository.findPracticeQuestionsByChapterAndDifficulty(chapterId, normalizedDifficulty, safeLimit);
        if ("wrong".equalsIgnoreCase(mode)) {
            if (userId == null) {
                throw new CustomApiException("Vui lòng đăng nhập để tiếp tục", HttpStatus.UNAUTHORIZED);
            }
            Set<Long> wrongQuestionIds = findWrongQuestionIds(userId, chapterId);
            questions = questions.stream()
                    .filter(question -> wrongQuestionIds.contains(question.getQuestionId()))
                    .toList();
        }
        return questions.stream().map(question -> questionMapper.toDto(question)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionDto> getSmartWrongPracticeQuestions(Long subjectId, Long chapterId, Integer limit, String difficulty, String strategy, UUID userId) {
        if (userId == null) {
            throw new CustomApiException("Vui lòng đăng nhập để tiếp tục", HttpStatus.UNAUTHORIZED);
        }
        int safeLimit = limit == null || limit <= 0 ? 10 : Math.min(limit, 100);
        Question.Difficulty normalizedDifficulty = difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty)
                ? null
                : questionMapper.parseDifficulty(difficulty);
        String normalizedStrategy = strategy == null || strategy.isBlank() ? "recent" : strategy.trim().toLowerCase();

        Map<AttemptQuestionKey, List<com.fita.vnua.quiz.model.entity.UserAnswer>> answersByAttemptQuestion =
                userAnswerRepository.findSubmittedAnswersByUserForPractice(userId, subjectId, chapterId).stream()
                        .filter(userAnswer -> Boolean.TRUE.equals(userAnswer.getQuestion().getPracticeEnabled()))
                        .filter(userAnswer -> normalizedDifficulty == null || normalizedDifficulty.equals(userAnswer.getQuestion().getDifficulty()))
                        .collect(Collectors.groupingBy(
                                userAnswer -> new AttemptQuestionKey(
                                        userAnswer.getUserExam().getUserExamId(),
                                        userAnswer.getQuestion().getQuestionId()
                                ),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        Map<Long, WrongQuestionStat> statsByQuestion = new HashMap<>();
        answersByAttemptQuestion.values().forEach(userAnswers -> {
            if (userAnswers.isEmpty()) {
                return;
            }
            Question question = userAnswers.get(0).getQuestion();
            Set<Long> correctAnswerIds = question.getAnswers().stream()
                    .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                    .map(answer -> answer.getOptionId())
                    .collect(Collectors.toSet());
            Set<Long> chosenAnswerIds = userAnswers.stream()
                    .map(userAnswer -> userAnswer.getAnswer().getOptionId())
                    .collect(Collectors.toSet());
            if (!correctAnswerIds.equals(chosenAnswerIds)) {
                var submittedAt = Optional.ofNullable(userAnswers.get(0).getUserExam().getEndTime())
                        .orElse(Optional.ofNullable(userAnswers.get(0).getUserExam().getUpdatedAt())
                                .orElse(userAnswers.get(0).getUserExam().getStartTime()));
                WrongQuestionStat currentStat = statsByQuestion.computeIfAbsent(
                        question.getQuestionId(),
                        id -> new WrongQuestionStat(question)
                );
                statsByQuestion.put(question.getQuestionId(), currentStat.recordWrong(submittedAt));
            }
        });

        List<WrongQuestionStat> wrongStats = statsByQuestion.values().stream()
                .filter(stat -> stat.question() != null)
                .toList();

        if ("weak-chapter".equals(normalizedStrategy)) {
            Optional<Long> weakestChapterId = wrongStats.stream()
                    .collect(Collectors.groupingBy(
                            stat -> stat.question().getChapter().getChapterId(),
                            Collectors.summingInt(WrongQuestionStat::wrongCount)
                    ))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey);
            if (weakestChapterId.isPresent()) {
                wrongStats = wrongStats.stream()
                        .filter(stat -> weakestChapterId.get().equals(stat.question().getChapter().getChapterId()))
                        .toList();
            }
        }

        Comparator<WrongQuestionStat> comparator = switch (normalizedStrategy) {
            case "frequent", "most-wrong" -> Comparator
                    .comparingInt(WrongQuestionStat::wrongCount)
                    .reversed()
                    .thenComparing(WrongQuestionStat::lastWrongAt, Comparator.reverseOrder());
            default -> Comparator.comparing(WrongQuestionStat::lastWrongAt, Comparator.reverseOrder());
        };

        return wrongStats.stream()
                .sorted(comparator)
                .limit(safeLimit)
                .map(WrongQuestionStat::question)
                .map(question -> questionMapper.toDto(question))
                .toList();
    }

    private Set<Long> findWrongQuestionIds(UUID userId, Long chapterId) {
        Map<Long, Set<Long>> chosenByQuestion = userAnswerRepository.findSubmittedAnswersByUserAndChapter(userId, chapterId).stream()
                .collect(Collectors.groupingBy(
                        answer -> answer.getQuestion().getQuestionId(),
                        Collectors.mapping(answer -> answer.getAnswer().getOptionId(), Collectors.toSet())
                ));

        Set<Long> wrongQuestionIds = new HashSet<>();
        questionRepository.findPracticeByChapter(chapterId).forEach(question -> {
            Set<Long> correctAnswerIds = question.getAnswers().stream()
                    .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                    .map(answer -> answer.getOptionId())
                    .collect(Collectors.toSet());
            Set<Long> chosenAnswerIds = chosenByQuestion.get(question.getQuestionId());
            if (chosenAnswerIds != null && !correctAnswerIds.equals(chosenAnswerIds)) {
                wrongQuestionIds.add(question.getQuestionId());
            }
        });
        return wrongQuestionIds;
    }

    private record AttemptQuestionKey(Long userExamId, Long questionId) {
    }

    private record WrongQuestionStat(Question question, int wrongCount, java.time.LocalDateTime lastWrongAt) {
        private WrongQuestionStat(Question question) {
            this(question, 0, java.time.LocalDateTime.MIN);
        }

        private WrongQuestionStat recordWrong(java.time.LocalDateTime submittedAt) {
            return new WrongQuestionStat(question, wrongCount + 1, submittedAt.isAfter(lastWrongAt) ? submittedAt : lastWrongAt);
        }
    }

    @Override
    public List<QuestionDto> getAllQuestion() {
        return questionRepository.findByDeletedFalse().stream().map(question -> questionMapper.toDto(question)).toList();
    }

    @Override
    public List<QuestionDto> getDeletedQuestions() {
        return questionRepository.findByDeletedTrue().stream().map(question -> questionMapper.toDto(question)).toList();
    }

    @Override
    public List<QuestionDto> searchQuestions(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllQuestion();
        }
        return questionRepository.findByContentContainingIgnoreCase(keyword.trim()).stream()
                .map(question -> questionMapper.toDto(question))
                .toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubject(Long subjectId) {
        return questionRepository.findQuestionsBySubjectId(subjectId).stream().map(question -> questionMapper.toDto(question)).toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubjectAndNumber(Long subjectId, int number) {
        List<Question> questions = questionRepository.findRandomQuestionsBySubject(subjectId, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> questionMapper.toDto(question))
                .toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubjectAndDifficulty(Long subjectId, int number, String difficulty) {
        // Lấy câu hỏi từ repository
        List<Question> questions = questionRepository.findQuestionsBySubjectAndDifficulty(subjectId, difficulty, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> questionMapper.toDto(question))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDto> getQuestionsByChapter(Long chapterId, int number) {
        // Lấy câu hỏi từ repository
        List<Question> questions = questionRepository.findQuestionsByChapter(chapterId, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> questionMapper.toDto(question))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDto> getQuestionsByExamId(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamId(examId);

        // Sử dụng ModelMapper để chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> questionMapper.toDto(question))
                .collect(Collectors.toList());
    }

    @Override
    public void importQuestionsFromExcel(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException {
        validateImportTarget(subjectId, chapterId);
        questionImportService.importQuestions(file, chapterId);
    }

    @Override
    public List<QuestionDto> filterQuestions(String keyword, Long subjectId, Long chapterId, String difficulty, Boolean deleted, Boolean examEnabled, Boolean practiceEnabled, UUID creatorId) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        Question.Difficulty normalizedDifficulty = difficulty == null || difficulty.isBlank()
                ? null
                : questionMapper.parseDifficulty(difficulty);
        List<Question> questions = questionRepository.filterQuestions(normalizedKeyword, subjectId, chapterId, normalizedDifficulty, deleted, examEnabled, practiceEnabled);
        if (creatorId != null) {
            var createdQuestionIds = auditLogRepository.findByEntityTypeAndActionAndActorId("QUESTION", "CREATE", creatorId).stream()
                    .map(log -> {
                        try {
                            return Long.valueOf(log.getEntityId());
                        } catch (NumberFormatException ignored) {
                            return null;
                        }
                    })
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());
            questions = questions.stream()
                    .filter(question -> createdQuestionIds.contains(question.getQuestionId()))
                    .toList();
        }
        return questions.stream()
                .map(question -> questionMapper.toDto(question))
                .toList();
    }

    @Override
    public Page<QuestionDto> filterQuestionsPage(String keyword, Long subjectId, Long chapterId, String difficulty, Boolean deleted, Boolean examEnabled, Boolean practiceEnabled, UUID creatorId, String usageFilter, Long excludeExamId, Boolean excludeUsedInSubject, Pageable pageable) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        Question.Difficulty normalizedDifficulty = difficulty == null || difficulty.isBlank()
                ? null
                : questionMapper.parseDifficulty(difficulty);
        List<Long> creatorQuestionIds = List.of(-1L);
        boolean creatorFilterEnabled = creatorId != null;
        if (creatorFilterEnabled) {
            creatorQuestionIds = findCreatedQuestionIds(creatorId);
            if (creatorQuestionIds.isEmpty()) {
                return new PageImpl<>(List.of(), pageable, 0);
            }
        }
        Page<Long> questionIdPage = questionRepository.filterQuestionIds(
                normalizedKeyword,
                subjectId,
                chapterId,
                normalizedDifficulty,
                deleted,
                examEnabled,
                practiceEnabled,
                creatorFilterEnabled,
                creatorQuestionIds,
                normalizeUsageFilter(usageFilter),
                excludeExamId,
                Boolean.TRUE.equals(excludeUsedInSubject),
                pageable
        );
        List<Long> questionIds = questionIdPage.getContent();
        if (questionIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, questionIdPage.getTotalElements());
        }

        Map<Long, Integer> orderById = new HashMap<>();
        for (int index = 0; index < questionIds.size(); index++) {
            orderById.put(questionIds.get(index), index);
        }
        List<QuestionDto> content = questionRepository.findWithDetailsByQuestionIds(questionIds).stream()
                .sorted(Comparator.comparingInt(question -> orderById.getOrDefault(question.getQuestionId(), Integer.MAX_VALUE)))
                .map(question -> questionMapper.toDto(question))
                .toList();
        return new PageImpl<>(content, pageable, questionIdPage.getTotalElements());
    }

    private List<Long> findCreatedQuestionIds(UUID creatorId) {
        return auditLogRepository.findByEntityTypeAndActionAndActorId("QUESTION", "CREATE", creatorId).stream()
                .map(log -> {
                    try {
                        return Long.valueOf(log.getEntityId());
                    } catch (NumberFormatException ignored) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private String normalizeUsageFilter(String usageFilter) {
        if ("used".equalsIgnoreCase(usageFilter)) {
            return "used";
        }
        if ("unused".equalsIgnoreCase(usageFilter)) {
            return "unused";
        }
        return "all";
    }

    @Override
    public ImportPreviewResponse previewImportQuestions(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException {
        validateImportTarget(subjectId, chapterId);
        return questionImportService.previewImport(file);
    }

    private void validateImportTarget(Long subjectId, Long chapterId) {
        Long chapterSubjectId = chapterRepository.findSubjectIdByChapterId(chapterId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(chapter.getDeleted())) {
            throw new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND);
        }
        if (!chapterSubjectId.equals(subjectId)) {
            throw new CustomApiException("Bạn không có quyền thao tác với câu hỏi này", HttpStatus.FORBIDDEN);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public QuestionDto create(QuestionDto questionDto) {
        Chapter chapter = chapterRepository.findById(questionDto.getChapterId())
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(chapter.getDeleted())) {
            throw new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND);
        }
        validateCorrectAnswers(questionDto);

        Question question = questionMapper.toEntity(questionDto, chapter);
        question = questionRepository.save(question);

        return questionMapper.toDto(question);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public QuestionDto update(Long questionId, QuestionDto questionDto) {
        // Tìm câu hỏi hiện tại
        var existingQuestion = questionRepository.findByQuestionIdAndDeletedFalse(questionId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND));

        if (userExamQuestionRepository.existsSnapshotByQuestionIdAndStatuses(questionId, List.of("IN_PROGRESS", "SUBMITTED"))) {
            if (hasLockedQuestionChanges(existingQuestion, questionDto)) {
                throw new CustomApiException("Cau hoi da co trong ket qua thi, khong the sua noi dung hoac dap an. Hay tao cau hoi moi va thay trong de.", HttpStatus.BAD_REQUEST);
            }
            updateAvailabilityFlags(existingQuestion, questionDto);
            return questionMapper.toDto(questionRepository.save(existingQuestion));
        }

        if (examQuestionRepository.existsByQuestionQuestionIdAndExamDeletedFalse(questionId)
                && hasLockedQuestionChanges(existingQuestion, questionDto)) {
            throw new CustomApiException("Cau hoi dang nam trong de thi, khong the sua noi dung hoac dap an. Hay tao cau hoi moi va thay trong de.", HttpStatus.BAD_REQUEST);
        }

        questionMapper.updateEntity(existingQuestion, questionDto);

        // Cập nhật danh sách câu trả lời
        if (questionDto.getAnswers() != null) {
            validateCorrectAnswers(questionDto);
            // Xóa các câu trả lời cũ
            answerRepository.deleteAll(existingQuestion.getAnswers());
            existingQuestion.getAnswers().clear();

            existingQuestion.getAnswers().addAll(questionMapper.toAnswers(questionDto.getAnswers(), existingQuestion));
        }
        // Lưu câu hỏi đã cập nhật
        Question question = questionRepository.save(existingQuestion);

        // Trả về phản hồi
        return questionMapper.toDto(question);
    }

    private boolean hasLockedQuestionChanges(Question existingQuestion, QuestionDto questionDto) {
        if (!Objects.equals(existingQuestion.getContent(), questionDto.getContent())) {
            return true;
        }
        if (!Objects.equals(existingQuestion.getImageUrl(), questionDto.getImageUrl())) {
            return true;
        }
        if (!Objects.equals(existingQuestion.getDifficulty(), questionMapper.parseDifficulty(questionDto.getDifficulty()))) {
            return true;
        }
        Question.QuestionType incomingType = questionMapper.parseQuestionType(questionDto.getQuestionType());
        Question.QuestionType existingType = existingQuestion.getQuestionType() == null
                ? Question.QuestionType.SINGLE_CHOICE
                : existingQuestion.getQuestionType();
        if (!Objects.equals(existingType, incomingType)) {
            return true;
        }
        if (questionDto.getAnswers() == null) {
            return false;
        }
        if (existingQuestion.getAnswers().size() != questionDto.getAnswers().size()) {
            return true;
        }
        Map<Long, AnswerDto> incomingAnswers = questionDto.getAnswers().stream()
                .filter(answer -> answer.getOptionId() != null)
                .collect(Collectors.toMap(AnswerDto::getOptionId, answer -> answer));
        if (incomingAnswers.size() != existingQuestion.getAnswers().size()) {
            return true;
        }
        return existingQuestion.getAnswers().stream().anyMatch(answer -> {
            AnswerDto incoming = incomingAnswers.get(answer.getOptionId());
            return incoming == null
                    || !Objects.equals(answer.getContent(), incoming.getContent())
                    || !Objects.equals(Boolean.TRUE.equals(answer.getIsCorrect()), Boolean.TRUE.equals(incoming.getIsCorrect()));
        });
    }

    private void updateAvailabilityFlags(Question question, QuestionDto questionDto) {
        if (questionDto.getExamEnabled() != null) {
            question.setExamEnabled(questionDto.getExamEnabled());
        }
        if (questionDto.getPracticeEnabled() != null) {
            question.setPracticeEnabled(questionDto.getPracticeEnabled());
        }
    }

    private void validateCorrectAnswers(QuestionDto questionDto) {
        List<AnswerDto> answers = questionDto.getAnswers();
        if (answers == null || answers.isEmpty()) {
            throw new CustomApiException("Vui lòng nhập danh sách đáp án", HttpStatus.BAD_REQUEST);
        }
        if (answers.size() < MIN_ANSWERS || answers.size() > MAX_ANSWERS) {
            throw new CustomApiException("Câu hỏi cần có từ 2 đến 8 đáp án", HttpStatus.BAD_REQUEST);
        }
        for (int index = 0; index < answers.size(); index++) {
            AnswerDto answer = answers.get(index);
            if (answer == null || answer.getContent() == null || answer.getContent().trim().isEmpty()) {
                throw new CustomApiException("Đáp án " + (char) ('A' + index) + " không được để trống", HttpStatus.BAD_REQUEST);
            }
        }

        long correctAnswerCount = answers.stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .count();
        Question.QuestionType questionType = questionMapper.parseQuestionType(questionDto.getQuestionType());

        if (questionType == Question.QuestionType.SINGLE_CHOICE && correctAnswerCount != 1) {
            throw new CustomApiException("Câu hỏi chọn một phải có đúng 1 đáp án đúng", HttpStatus.BAD_REQUEST);
        }
        if (questionType == Question.QuestionType.MULTIPLE_CHOICE && correctAnswerCount < 2) {
            throw new CustomApiException("Câu hỏi chọn nhiều phải có ít nhất 2 đáp án đúng", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public Response delete(Long questionId) {
        if (examQuestionRepository.existsByQuestionQuestionIdAndExamDeletedFalse(questionId)) {
            throw new CustomApiException("Cau hoi dang nam trong de thi. Vui long go cau hoi khoi de truoc khi xoa.", HttpStatus.BAD_REQUEST);
        }

        softDeleteService.deleteQuestion(questionId, null);

        return Response.builder()
                .responseMessage("Xóa câu hỏi thành công")
                .responseCode("200 OK").build();
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public QuestionDto restore(Long questionId) {
        softDeleteService.restoreQuestion(questionId);
        Question restoredQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND));
        return questionMapper.toDto(restoredQuestion);
    }

    @Override
    public Map<String, Object> totalQuestionBySubject(Long subjectId) {
        List<Chapter> chapters = chapterRepository.findBySubject(subjectId);
        int totalQuestion = 0, totalMedium = 0, totalEasy = 0, totalHard = 0;
        Map<Long, Map<String, Object>> totalQuestionByChapter = new HashMap<>();

        for (Chapter chapter : chapters) {
            Map<String, Object> chapterDetails = new HashMap<>();
            chapterDetails.put("chapterName", chapter.getName());
            chapterDetails.put("totalQuestions", 0);
            chapterDetails.put("medium", 0);
            chapterDetails.put("easy", 0);
            chapterDetails.put("hard", 0);
            totalQuestionByChapter.put(chapter.getChapterId(), chapterDetails);
        }

        List<Object[]> counts = questionRepository.countQuestionsBySubjectGroupedByChapterAndDifficulty(subjectId);

        for (Object[] row : counts) {
            Long chapterId = (Long) row[0];
            Question.Difficulty difficulty = (Question.Difficulty) row[1];
            int count = ((Long) row[2]).intValue();

            Map<String, Object> chapterDetails = totalQuestionByChapter.get(chapterId);
            if (chapterDetails != null) {
                int chapterTotal = (int) chapterDetails.get("totalQuestions") + count;
                chapterDetails.put("totalQuestions", chapterTotal);

                if (difficulty == Question.Difficulty.MEDIUM) {
                    chapterDetails.put("medium", count);
                    totalMedium += count;
                } else if (difficulty == Question.Difficulty.EASY) {
                    chapterDetails.put("easy", count);
                    totalEasy += count;
                } else if (difficulty == Question.Difficulty.HARD) {
                    chapterDetails.put("hard", count);
                    totalHard += count;
                }
                totalQuestion += count;
            }
        }

        return Map.of(
                "totalQuestion", totalQuestion,
                "totalMedium", totalMedium,
                "totalEasy", totalEasy,
                "totalHard", totalHard,
                "totalQuestionByChapter", totalQuestionByChapter
        );
    }
}
