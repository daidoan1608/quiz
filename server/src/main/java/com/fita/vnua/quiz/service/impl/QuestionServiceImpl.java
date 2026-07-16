package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ImportPreviewResponse;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.AuditLogRepository;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ChapterRepository chapterRepository;
    private final ModelMapper modelMapper;
    private final QuestionImportService questionImportService;
    private final QuestionMapper questionMapper;
    private final SoftDeleteService softDeleteService;
    private final AuditLogRepository auditLogRepository;
    private final UserAnswerRepository userAnswerRepository;

    @Override
    public Optional<QuestionDto> getQuestionById(Long questionId) {
        return questionRepository.findByQuestionIdAndDeletedFalse(questionId)
                .map(question -> modelMapper.map(question, QuestionDto.class));
    }

    @Override
    public List<QuestionDto> getQuestionsByChapterId(Long chapterId) {
        return questionRepository.findByChapter(chapterId).stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> getPracticeQuestionsByChapter(Long chapterId, Integer limit, String difficulty, String mode, UUID userId) {
        int safeLimit = limit == null || limit <= 0 ? 50 : Math.min(limit, 100);
        String normalizedDifficulty = difficulty == null || difficulty.isBlank() || "ALL".equalsIgnoreCase(difficulty)
                ? null
                : questionMapper.parseDifficulty(difficulty).name();

        List<Question> questions = questionRepository.findQuestionsByChapterAndDifficulty(chapterId, normalizedDifficulty, safeLimit);
        if ("wrong".equalsIgnoreCase(mode)) {
            if (userId == null) {
                throw new CustomApiException("Access denied", HttpStatus.UNAUTHORIZED);
            }
            Set<Long> wrongQuestionIds = findWrongQuestionIds(userId, chapterId);
            questions = questions.stream()
                    .filter(question -> wrongQuestionIds.contains(question.getQuestionId()))
                    .toList();
        }
        return questions.stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    private Set<Long> findWrongQuestionIds(UUID userId, Long chapterId) {
        Map<Long, Set<Long>> chosenByQuestion = userAnswerRepository.findSubmittedAnswersByUserAndChapter(userId, chapterId).stream()
                .collect(Collectors.groupingBy(
                        answer -> answer.getQuestion().getQuestionId(),
                        Collectors.mapping(answer -> answer.getAnswer().getOptionId(), Collectors.toSet())
                ));

        Set<Long> wrongQuestionIds = new HashSet<>();
        questionRepository.findByChapter(chapterId).forEach(question -> {
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

    @Override
    public List<QuestionDto> getAllQuestion() {
        return questionRepository.findByDeletedFalse().stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> getDeletedQuestions() {
        return questionRepository.findByDeletedTrue().stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> searchQuestions(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllQuestion();
        }
        return questionRepository.findByContentContainingIgnoreCase(keyword.trim()).stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubject(Long subjectId) {
        return questionRepository.findQuestionsBySubjectId(subjectId).stream().map(question -> modelMapper.map(question, QuestionDto.class)).toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubjectAndNumber(Long subjectId, int number) {
        List<Question> questions = questionRepository.findRandomQuestionsBySubject(subjectId, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .toList();
    }

    @Override
    public List<QuestionDto> getQuestionsBySubjectAndDifficulty(Long subjectId, int number, String difficulty) {
        // Lấy câu hỏi từ repository
        List<Question> questions = questionRepository.findQuestionsBySubjectAndDifficulty(subjectId, difficulty, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDto> getQuestionsByChapter(Long chapterId, int number) {
        // Lấy câu hỏi từ repository
        List<Question> questions = questionRepository.findQuestionsByChapter(chapterId, number);

        // Chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDto> getQuestionsByExamId(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamId(examId);

        // Sử dụng ModelMapper để chuyển đổi từ Entity sang DTO
        return questions.stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void importQuestionsFromExcel(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException {
        validateImportTarget(subjectId, chapterId);
        questionImportService.importQuestions(file, chapterId);
    }

    @Override
    public List<QuestionDto> filterQuestions(String keyword, Long subjectId, Long chapterId, String difficulty, Boolean deleted, UUID creatorId) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        Question.Difficulty normalizedDifficulty = difficulty == null || difficulty.isBlank()
                ? null
                : questionMapper.parseDifficulty(difficulty);
        List<Question> questions = questionRepository.filterQuestions(normalizedKeyword, subjectId, chapterId, normalizedDifficulty, deleted);
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
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .toList();
    }

    @Override
    public ImportPreviewResponse previewImportQuestions(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException {
        validateImportTarget(subjectId, chapterId);
        return questionImportService.previewImport(file);
    }

    private void validateImportTarget(Long subjectId, Long chapterId) {
        Long chapterSubjectId = chapterRepository.findSubjectIdByChapterId(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(chapter.getDeleted())) {
            throw new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND);
        }
        if (!chapterSubjectId.equals(subjectId)) {
            throw new CustomApiException("Access denied", HttpStatus.FORBIDDEN);
        }
    }

    @Override
    @Transactional
    public QuestionDto create(QuestionDto questionDto) {
        Chapter chapter = chapterRepository.findById(questionDto.getChapterId())
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(chapter.getDeleted())) {
            throw new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND);
        }

        Question question = questionMapper.toEntity(questionDto, chapter);
        question = questionRepository.save(question);

        return modelMapper.map(question, QuestionDto.class);
    }

    @Override
    @Transactional
    public QuestionDto update(Long questionId, QuestionDto questionDto) {
        // Tìm câu hỏi hiện tại
        var existingQuestion = questionRepository.findByQuestionIdAndDeletedFalse(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));

        questionMapper.updateEntity(existingQuestion, questionDto);

        // Cập nhật danh sách câu trả lời
        if (questionDto.getAnswers() != null) {
            // Xóa các câu trả lời cũ
            answerRepository.deleteAll(existingQuestion.getAnswers());
            existingQuestion.getAnswers().clear();

            existingQuestion.getAnswers().addAll(questionMapper.toAnswers(questionDto.getAnswers(), existingQuestion));
        }
        // Lưu câu hỏi đã cập nhật
        Question question = questionRepository.save(existingQuestion);

        // Trả về phản hồi
        return modelMapper.map(question, QuestionDto.class);
    }

    @Override
    public Response delete(Long questionId) {
        softDeleteService.deleteQuestion(questionId, null);

        return Response.builder()
                .responseMessage("Question soft deleted successfully")
                .responseCode("200 OK").build();
    }

    @Override
    public QuestionDto restore(Long questionId) {
        softDeleteService.restoreQuestion(questionId);
        Question restoredQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));
        return modelMapper.map(restoredQuestion, QuestionDto.class);
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
