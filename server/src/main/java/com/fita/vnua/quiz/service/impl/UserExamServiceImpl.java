package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.QuestionType;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.SaveExamAttemptAnswerRequest;
import com.fita.vnua.quiz.model.dto.request.StartExamAttemptRequest;
import com.fita.vnua.quiz.model.dto.request.UpdateExamAttemptProgressRequest;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.ExamAttemptResponse;
import com.fita.vnua.quiz.model.dto.result.PeriodRange;
import com.fita.vnua.quiz.model.dto.response.RankingResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.UserExamService;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.service.mapper.UserExamMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserExamServiceImpl implements UserExamService {
    private static final Duration ATTEMPT_WRITE_LOCK_TTL = Duration.ofSeconds(5);
    private static final int ATTEMPT_WRITE_QUEUE_MAX_ATTEMPTS = 50;
    private static final long ATTEMPT_WRITE_QUEUE_WAIT_MS = 100L;

    private final UserExamRepository userExamRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserExamQuestionRepository userExamQuestionRepository;
    private final UserExamAttemptStatsService attemptStatsService;
    private final UserExamMapper userExamMapper;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public List<UserExamSummaryDto> getUserExamSummaries(LocalDateTime fromDate, LocalDateTime toDate) {
        List<UserExamRepository.UserExamSummaryProjection> projections = userExamRepository.getUserExamSummaries(fromDate, toDate);

        return projections.stream().map(this::mapSummaryProjection).collect(Collectors.toList());
    }

    @Override
    public List<UserExamSummaryDto> getUserExamSummaries(String period) {
        PeriodRange range = resolvePeriodRange(period);
        return getUserExamSummaries(range.fromDate(), range.toDate());
    }

    @Override
    @Cacheable(
            value = "ranking",
            key = "'rankings:' + (#fromDate == null ? 'all' : #fromDate.toString()) + ':' + (#toDate == null ? 'all' : #toDate.toString()) + ':' + (#subjectName == null ? 'all' : #subjectName) + ':' + #criteria + ':' + #limit + ':' + (#currentUserId == null ? 'anonymous' : #currentUserId.toString())"
    )
    public RankingResponse getRankings(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String subjectName,
            String criteria,
            int limit,
            UUID currentUserId
    ) {
        String normalizedSubject = subjectName == null || subjectName.isBlank() ? null : subjectName.trim();
        String normalizedCriteria = "avg".equalsIgnoreCase(criteria) ? "avg" : "total";
        int normalizedLimit = Math.min(Math.max(limit, 1), 50);

        List<UserExamSummaryDto> topUsers = userExamRepository
                .getTopRankings(fromDate, toDate, normalizedSubject, normalizedCriteria, normalizedLimit)
                .stream()
                .map(this::mapSummaryProjection)
                .toList();

        UserExamSummaryDto currentUser = null;
        if (currentUserId != null) {
            currentUser = userExamRepository
                    .getUserRanking(fromDate, toDate, normalizedSubject, normalizedCriteria, uuidToBytes(currentUserId))
                    .map(this::mapSummaryProjection)
                    .orElse(null);
        }

        return new RankingResponse(topUsers, currentUser);
    }

    @Override
    public RankingResponse getRankings(String period, String subjectName, String criteria, int limit, UUID currentUserId) {
        PeriodRange range = resolvePeriodRange(period);
        return getRankings(range.fromDate(), range.toDate(), subjectName, criteria, limit, currentUserId);
    }

    @Override
    public PeriodRange resolvePeriodRange(String period) {
        LocalDate today = LocalDate.now();
        return switch (period == null ? "all" : period.toLowerCase()) {
            case "week" -> new PeriodRange(today.with(DayOfWeek.MONDAY).atStartOfDay(), today.with(DayOfWeek.MONDAY).plusWeeks(1).atStartOfDay());
            case "month" -> new PeriodRange(today.withDayOfMonth(1).atStartOfDay(), today.withDayOfMonth(1).plusMonths(1).atStartOfDay());
            default -> new PeriodRange(null, null);
        };
    }

    private UserExamSummaryDto mapSummaryProjection(UserExamRepository.UserExamSummaryProjection proj) {
        UserExamSummaryDto dto = new UserExamSummaryDto();
        dto.setUserId(bytesToUUID(proj.getUserId()));
        dto.setUsername(proj.getUsername());
        dto.setAvatarUrl(proj.getAvatarUrl());
        dto.setAttemptCount(proj.getAttemptCount());
        dto.setAvgScore(proj.getAvgScore());
        dto.setTotalScore(proj.getTotalScore());
        dto.setTotalDurationSeconds(proj.getTotalDurationSeconds());
        dto.setSubjectName(proj.getSubjects());
        dto.setRank(proj.getRankPosition());
        return dto;
    }

    protected UUID bytesToUUID(byte[] bytes) {
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long high = bb.getLong();
        long low = bb.getLong();
        return new UUID(high, low);
    }

    protected byte[] uuidToBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }

    @Override
    public UserExamResponse getUserExamByIdForUser(Long id, UUID currentUserId) {
        UserExam userExam = getUserExamForCurrentUser(id, currentUserId);
        return buildUserExamResponse(userExam);
    }

    @Override
    public UserExamResponse getUserExamByIdForAdmin(Long id) {
        UserExam userExam = userExamRepository.findByIdWithExamSubjectAndUser(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy bài thi của người dùng", HttpStatus.NOT_FOUND));
        return buildUserExamResponse(userExam);
    }

    private UserExamResponse buildUserExamResponse(UserExam userExam) {
        List<UserAnswer> answers = userAnswerRepository.findUserAnswersByUserExamId(userExam.getUserExamId());
        return userExamMapper.toDetailResponse(
                userExam,
                attemptStatsService.loadAttemptStats(userExam),
                answers,
                getAttemptQuestionDtos(userExam)
        );
    }

    @Override
    @Deprecated(since = "2026-07-23", forRemoval = false)
    @Transactional
    @CacheEvict(value = "ranking", allEntries = true)
    public UserExamDto createUserExam(UserExamRequest userExamRequest, UUID currentUserId) {
        UserExamDto userExamDto = userExamRequest.getUserExamDto();
        List<UserAnswerDto> userAnswerDtos = userExamRequest.getUserAnswerDtos();

        if (currentUserId == null) {
            throw new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.UNAUTHORIZED);
        }
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
        Exam exam = findActiveExam(userExamDto.getExamId());

        // Tự động tính điểm ở Backend
        float score = 0;
        int correctAnswersCount = 0;
        List<Question> questions = questionRepository.findQuestionsByExamId(exam.getExamId());
        int totalExamQuestions = questions.size();

        if (totalExamQuestions > 0) {
            Map<Long, Set<Long>> userAnswersMap = userAnswerDtos.stream()
                    .filter(ua -> ua.getQuestionId() != null && ua.getAnswerId() != null)
                    .collect(Collectors.groupingBy(
                            UserAnswerDto::getQuestionId,
                            Collectors.mapping(UserAnswerDto::getAnswerId, Collectors.toSet())
                    ));

            for (Question q : questions) {
                Set<Long> chosenAnswerIds = userAnswersMap.get(q.getQuestionId());
                if (isQuestionCorrect(q, chosenAnswerIds)) {
                    correctAnswersCount++;
                }
            }
            score = ((float) correctAnswersCount / totalExamQuestions) * 100;
        }

        UserExam userExam = new UserExam();
        userExam.setStartTime(userExamDto.getStartTime());
        userExam.setEndTime(userExamDto.getEndTime());
            userExam.setScore(score);
            userExam.setStatus("SUBMITTED");
            userExam.setUpdatedAt(LocalDateTime.now());
            userExam.setUser(user);
            userExam.setExam(exam);

        UserExam savedUserExam = userExamRepository.save(userExam);

        Set<Long> answerIds = userAnswerDtos.stream()
                .map(UserAnswerDto::getAnswerId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Answer> answersById = answerIds.isEmpty()
                ? Map.of()
                : answerRepository.findAllById(answerIds).stream()
                        .collect(Collectors.toMap(Answer::getOptionId, answer -> answer));

        Set<Long> questionIds = userAnswerDtos.stream()
                .map(UserAnswerDto::getQuestionId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Question> questionsById = questionIds.isEmpty()
                ? Map.of()
                : questionRepository.findWithDetailsByQuestionIds(new ArrayList<>(questionIds)).stream()
                        .collect(Collectors.toMap(Question::getQuestionId, question -> question));

        for (UserAnswerDto userAnswerDto : userAnswerDtos) {
            // Kiểm tra các trường quan trọng trước khi thao tác
            if (userAnswerDto.getAnswerId() == null || userAnswerDto.getQuestionId() == null) {
                // Xử lý trường hợp thiếu dữ liệu
                log.error("Invalid user answer data: {}", userAnswerDto);
                continue;
            }

            userAnswerDto.setUserExamId(savedUserExam.getUserExamId());

            UserAnswer userAnswer = new UserAnswer();
            userAnswer.setUserExam(savedUserExam);

            Answer answer = answersById.get(userAnswerDto.getAnswerId());
            if (answer == null) {
                throw new EntityNotFoundException("Không tìm thấy đáp án với id: " + userAnswerDto.getAnswerId());
            }
            userAnswer.setAnswer(answer);

            Question question = questionsById.get(userAnswerDto.getQuestionId());
            if (question == null) {
                throw new EntityNotFoundException("Không tìm thấy câu hỏi");
            }
            userAnswer.setQuestion(question);

            userAnswerRepository.save(userAnswer);
        }
        return userExamMapper.toListDto(savedUserExam);
    }

    @Override
    public List<UserExamResponse> getUserExamByUserId(UUID userId) {
        List<UserExam> userExams = userExamRepository.findUserExamsByUserId(userId);
        return getUserExamResponses(userExams);
    }

    @Override
    public List<Map<Long, Object>> getExamAttemptsByUserId(UUID userId) {
        return userExamRepository.countExamsByUserId(userId);
    }

    @Override
    public Page<UserExamResponse> getAllUserExamsForAdmin(
            String keyword,
            Long categoryId,
            Long subjectId,
            LocalDateTime startedFrom,
            LocalDateTime startedTo,
            Pageable pageable
    ) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        return userExamRepository.filterForAdmin(
                        normalizedKeyword,
                        categoryId,
                        subjectId,
                        startedFrom,
                        startedTo,
                        pageable
                )
                .map(userExamMapper::toAdminListResponse);
    }

    @Override
    public List<UserExamResponse> getExamsByUserAndSubject(UUID userId, Long subjectId) {
        List<UserExam> userExams = userExamRepository.findUserExamsByUserIdAndSubjectId(userId, subjectId);
        return getUserExamResponses(userExams);
    }

    @Override
    public List<UserExamResponse> getLast7ExamsByUser(UUID userId) {
        List<UserExam> userExams = userExamRepository.findLast7ExamsByUser(userId, PageRequest.of(0, 7));
        return getUserExamResponses(userExams);
    }

    private List<UserExamResponse> getUserExamResponses(List<UserExam> userExams) {
        Map<Long, UserExamAttemptStatsService.AttemptStats> statsByAttempt = attemptStatsService.loadAttemptStats(userExams);
        return userExams.stream()
                .map(userExam -> userExamMapper.toListResponse(userExam, statsByAttempt.get(userExam.getUserExamId())))
                .toList();
    }

    @Override
    @Transactional
    public synchronized ExamAttemptResponse startOrResumeAttempt(StartExamAttemptRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.UNAUTHORIZED);
        }
        List<UserExam> existingAttempts = userExamRepository.findInProgressByUserIdAndExamId(currentUserId, request.getExamId());
        if (!existingAttempts.isEmpty()) {
            UserExam latestAttempt = existingAttempts.get(0);
            closeDuplicatedInProgressAttempts(existingAttempts, latestAttempt);
            return buildAttemptResponse(latestAttempt);
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
        Exam exam = findActiveExam(request.getExamId());

        // Kiểm tra lại sau khi load User/Exam để tránh trường hợp 2 request start chạy gần như đồng thời
        // tạo ra 2 bản ghi IN_PROGRESS cho cùng user + exam.
        existingAttempts = userExamRepository.findInProgressByUserIdAndExamId(currentUserId, request.getExamId());
        if (!existingAttempts.isEmpty()) {
            UserExam latestAttempt = existingAttempts.get(0);
            closeDuplicatedInProgressAttempts(existingAttempts, latestAttempt);
            return buildAttemptResponse(latestAttempt);
        }

        UserExam userExam = new UserExam();
        userExam.setUser(user);
        userExam.setExam(exam);
        userExam.setStartTime(LocalDateTime.now());
        userExam.setStatus("IN_PROGRESS");
        userExam.setRemainingTime(exam.getDuration() == null ? null : exam.getDuration() * 60);
        userExam.setCurrentQuestionIndex(0);
        userExam.setUpdatedAt(LocalDateTime.now());

        UserExam savedAttempt = userExamRepository.save(userExam);
        List<Question> attemptQuestions = new ArrayList<>(questionRepository.findQuestionsByExamId(exam.getExamId()));
        Collections.shuffle(attemptQuestions);
        saveAttemptQuestionSnapshot(savedAttempt, attemptQuestions);
        return buildAttemptResponse(savedAttempt);
    }

    @Override
    @Transactional
    public List<ExamAttemptResponse> getInProgressAttempts(UUID userId) {
        return userExamRepository.findInProgressByUserId(userId).stream()
                .filter(this::keepMeaningfulInProgressAttempt)
                .map(this::buildAttemptResponse)
                .collect(Collectors.toList());
    }

    private boolean keepMeaningfulInProgressAttempt(UserExam userExam) {
        if (!userAnswerRepository.findUserAnswersByUserExamId(userExam.getUserExamId()).isEmpty()) {
            return true;
        }

        LocalDateTime now = LocalDateTime.now();
        userExam.setStatus("CANCELLED");
        userExam.setEndTime(now);
        userExam.setUpdatedAt(now);
        userExamRepository.save(userExam);
        return false;
    }

    @Override
    @Transactional
    public ExamAttemptResponse saveAttemptAnswer(Long userExamId, SaveExamAttemptAnswerRequest request, UUID currentUserId) {
        return withAttemptWriteQueue(userExamId, () -> {
            try {
                UserExam userExam = getInProgressUserExam(userExamId, currentUserId);
                return saveAttemptAnswerInternal(userExam, userExamId, request);
            } catch (CannotAcquireLockException exception) {
                throw new CustomApiException("Đang lưu đáp án, vui lòng thử lại", HttpStatus.CONFLICT);
            }
        });
    }

    private ExamAttemptResponse saveAttemptAnswerInternal(UserExam userExam, Long userExamId, SaveExamAttemptAnswerRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy câu hỏi"));
        if (!isQuestionInAttempt(userExam, question.getQuestionId())) {
            throw new CustomApiException("Câu hỏi không thuộc lượt làm bài này", HttpStatus.BAD_REQUEST);
        }

        List<Long> answerIds = request.getAnswerIds() != null ? request.getAnswerIds() : new ArrayList<>();
        if (answerIds.isEmpty() && request.getAnswerId() != null) {
            answerIds.add(request.getAnswerId());
        }

        userAnswerRepository.deleteByUserExamIdAndQuestionId(userExamId, request.getQuestionId());
        userAnswerRepository.flush();
        Set<Long> uniqueAnswerIds = new HashSet<>(answerIds);
        Map<Long, Answer> answersById = uniqueAnswerIds.isEmpty()
                ? Map.of()
                : answerRepository.findAllById(uniqueAnswerIds).stream()
                        .collect(Collectors.toMap(Answer::getOptionId, answer -> answer));
        for (Long answerId : uniqueAnswerIds) {
            Answer answer = answersById.get(answerId);
            if (answer == null) {
                throw new EntityNotFoundException("Không tìm thấy đáp án với id: " + answerId);
            }
            UserAnswer userAnswer = new UserAnswer();
            userAnswer.setUserExam(userExam);
            userAnswer.setQuestion(question);
            userAnswer.setAnswer(answer);
            userAnswerRepository.save(userAnswer);
        }

        updateAttemptProgressFields(userExam, request.getCurrentQuestionIndex(), request.getRemainingTime());
        return buildLightAttemptResponse(userExamRepository.save(userExam));
    }

    @Override
    @Transactional
    public ExamAttemptResponse updateAttemptProgress(Long userExamId, UpdateExamAttemptProgressRequest request, UUID currentUserId) {
        return withAttemptWriteQueue(userExamId, () -> {
            UserExam userExam = getInProgressUserExam(userExamId, currentUserId);
            updateAttemptProgressFields(userExam, request.getCurrentQuestionIndex(), request.getRemainingTime());
            return buildLightAttemptResponse(userExamRepository.save(userExam));
        });
    }

    private ExamAttemptResponse withAttemptWriteQueue(Long userExamId, Supplier<ExamAttemptResponse> action) {
        String lockKey = "quiz:exam-attempt:" + userExamId + ":write-lock";
        String lockToken = UUID.randomUUID().toString();

        for (int attempt = 0; attempt < ATTEMPT_WRITE_QUEUE_MAX_ATTEMPTS; attempt++) {
            Boolean acquired = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, lockToken, ATTEMPT_WRITE_LOCK_TTL);
            if (Boolean.TRUE.equals(acquired)) {
                try {
                    return action.get();
                } finally {
                    String currentToken = stringRedisTemplate.opsForValue().get(lockKey);
                    if (lockToken.equals(currentToken)) {
                        stringRedisTemplate.delete(lockKey);
                    }
                }
            }
            sleepBeforeRetryingAttemptWrite();
        }

        throw new CustomApiException("Hệ thống đang lưu tiến độ, vui lòng thử lại", HttpStatus.CONFLICT);
    }

    private void sleepBeforeRetryingAttemptWrite() {
        try {
            Thread.sleep(ATTEMPT_WRITE_QUEUE_WAIT_MS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new CustomApiException("Hệ thống đang lưu tiến độ, vui lòng thử lại", HttpStatus.CONFLICT);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "ranking", allEntries = true)
    public UserExamDto submitAttempt(Long userExamId, UUID currentUserId) {
        UserExam userExam = getInProgressUserExam(userExamId, currentUserId);
        return submitAttemptInternal(userExam, userExamId);
    }

    @Override
    public List<Question> getAttemptQuestionsForSubmittedAttempt(Long userExamId, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN));
        UserExam userExam = (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.MOD)
                ? userExamRepository.findByIdWithExamSubjectAndUser(userExamId).orElseThrow(() -> new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN))
                : getUserExamForCurrentUser(userExamId, currentUserId);
        if (!"SUBMITTED".equals(userExam.getStatus())) {
            throw new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN);
        }
        return getAttemptQuestions(userExam);
    }

    @Override
    public List<QuestionDto> getAttemptQuestionDtosForSubmittedAttempt(Long userExamId, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomApiException("Ban khong co quyen thuc hien thao tac nay", HttpStatus.FORBIDDEN));
        UserExam userExam = (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.MOD)
                ? userExamRepository.findByIdWithExamSubjectAndUser(userExamId).orElseThrow(() -> new CustomApiException("Ban khong co quyen thuc hien thao tac nay", HttpStatus.FORBIDDEN))
                : getUserExamForCurrentUser(userExamId, currentUserId);
        if (!"SUBMITTED".equals(userExam.getStatus())) {
            throw new CustomApiException("Ban khong co quyen thuc hien thao tac nay", HttpStatus.FORBIDDEN);
        }
        return getAttemptQuestionDtos(userExam);
    }

    private UserExamDto submitAttemptInternal(UserExam userExam, Long userExamId) {
        List<Question> questions = getAttemptQuestions(userExam);
        List<UserAnswer> userAnswers = userAnswerRepository.findUserAnswersByUserExamId(userExamId);
        Map<Long, Set<Long>> userAnswersMap = userAnswers.stream()
                .collect(Collectors.groupingBy(
                        ua -> ua.getQuestion().getQuestionId(),
                        Collectors.mapping(ua -> ua.getAnswer().getOptionId(), Collectors.toSet())
                ));

        int correctAnswersCount = 0;
        for (Question q : questions) {
            if (isQuestionCorrect(q, userAnswersMap.get(q.getQuestionId()))) {
                correctAnswersCount++;
            }
        }
        float score = questions.isEmpty() ? 0 : ((float) correctAnswersCount / questions.size()) * 100;
        userExam.setScore(score);
        userExam.setEndTime(LocalDateTime.now());
        userExam.setStatus("SUBMITTED");
        userExam.setRemainingTime(0);
        userExam.setUpdatedAt(LocalDateTime.now());
        return userExamMapper.toListDto(userExamRepository.save(userExam));
    }

    private boolean isQuestionCorrect(Question question, Set<Long> chosenAnswerIds) {
        if (chosenAnswerIds == null || chosenAnswerIds.isEmpty()) return false;

        Set<Long> correctAnswerIds = question.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .map(Answer::getOptionId)
                .collect(Collectors.toSet());
        if (correctAnswerIds.isEmpty()) return false;

        QuestionType questionType = question.getQuestionType() != null
                ? question.getQuestionType()
                : QuestionType.SINGLE_CHOICE;

        return switch (questionType) {
            case SINGLE_CHOICE -> chosenAnswerIds.size() == 1
                    && correctAnswerIds.size() == 1
                    && correctAnswerIds.equals(chosenAnswerIds);
            case MULTIPLE_CHOICE -> correctAnswerIds.equals(chosenAnswerIds);
            case FILL_IN_THE_BLANK -> false;
        };
    }

    private void closeDuplicatedInProgressAttempts(List<UserExam> existingAttempts, UserExam keepAttempt) {
        if (existingAttempts.size() <= 1) return;
        LocalDateTime now = LocalDateTime.now();
        for (UserExam attempt : existingAttempts) {
            if (attempt.getUserExamId().equals(keepAttempt.getUserExamId())) continue;
            attempt.setStatus("CANCELLED");
            attempt.setEndTime(now);
            attempt.setUpdatedAt(now);
            userExamRepository.save(attempt);
        }
    }

    private UserExam getInProgressUserExam(Long userExamId, UUID currentUserId) {
        UserExam userExam = getUserExamForCurrentUser(userExamId, currentUserId);
        if (!"IN_PROGRESS".equals(userExam.getStatus())) {
            throw new IllegalStateException("Lượt làm bài không ở trạng thái đang thực hiện");
        }
        return userExam;
    }

    private UserExam getInProgressUserExamForUpdate(Long userExamId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.UNAUTHORIZED);
        }
        UserExam userExam = userExamRepository.findByIdAndUserIdForUpdate(userExamId, currentUserId)
                .orElseThrow(() -> new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN));
        if (!"IN_PROGRESS".equals(userExam.getStatus())) {
            throw new IllegalStateException("Lượt làm bài không ở trạng thái đang thực hiện");
        }
        return userExam;
    }

    private UserExam getUserExamForCurrentUser(Long userExamId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.UNAUTHORIZED);
        }
        return userExamRepository.findByIdAndUserId(userExamId, currentUserId)
                .orElseThrow(() -> new CustomApiException("Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN));
    }

    private void updateAttemptProgressFields(UserExam userExam, Integer currentQuestionIndex, Integer remainingTime) {
        if (currentQuestionIndex != null) userExam.setCurrentQuestionIndex(currentQuestionIndex);
        if (remainingTime != null) userExam.setRemainingTime(Math.max(remainingTime, 0));
        userExam.setUpdatedAt(LocalDateTime.now());
    }

    private ExamAttemptResponse buildAttemptResponse(UserExam userExam) {
        List<UserAnswer> answers = userAnswerRepository.findUserAnswersByUserExamId(userExam.getUserExamId());
        List<QuestionDto> questions = getAttemptQuestionDtos(userExam);
        return userExamMapper.toAttemptResponse(userExam, answers, questions);
    }

    private ExamAttemptResponse buildLightAttemptResponse(UserExam userExam) {
        return userExamMapper.toAttemptResponse(userExam, List.of(), List.of());
    }

    private void saveAttemptQuestionSnapshot(UserExam userExam, List<Question> questions) {
        if (userExamQuestionRepository == null) {
            return;
        }
        if (userExamQuestionRepository.existsByUserExamUserExamId(userExam.getUserExamId())) {
            return;
        }
        for (int i = 0; i < questions.size(); i++) {
            Question question = questions.get(i);
            UserExamQuestion snapshot = new UserExamQuestion();
            snapshot.setUserExam(userExam);
            snapshot.setQuestion(question);
            snapshot.setPosition(i);
            snapshot.setQuestionContentSnapshot(question.getContent());
            snapshot.setQuestionImageUrlSnapshot(question.getImageUrl());
            snapshot.setQuestionDifficultySnapshot(question.getDifficulty() == null ? null : question.getDifficulty().name());
            snapshot.setQuestionTypeSnapshot(question.getQuestionType() == null ? null : question.getQuestionType().name());
            snapshot.setAnswersSnapshotJson(userExamMapper.toAnswersSnapshotJson(question));
            userExamQuestionRepository.save(snapshot);
        }
    }

    private List<Question> getAttemptQuestions(UserExam userExam) {
        if (userExamQuestionRepository == null) {
            return getExamQuestionsIncludingDeleted(userExam.getExam().getExamId());
        }
        List<UserExamQuestion> snapshots = findAttemptQuestionSnapshots(userExam.getUserExamId());
        if (!snapshots.isEmpty()) {
            return snapshots.stream().map(UserExamQuestion::getQuestion).toList();
        }
        return getExamQuestionsIncludingDeleted(userExam.getExam().getExamId());
    }

    private List<QuestionDto> getAttemptQuestionDtos(UserExam userExam) {
        if (userExamQuestionRepository == null) {
            return userExamMapper.toQuestionDtos(getAttemptQuestions(userExam));
        }
        List<UserExamQuestion> snapshots = findAttemptQuestionSnapshots(userExam.getUserExamId());
        if (!snapshots.isEmpty() && snapshots.stream().allMatch(snapshot -> snapshot.getQuestionContentSnapshot() != null)) {
            return snapshots.stream()
                    .map(userExamMapper::toQuestionDto)
                    .toList();
        }
        return userExamMapper.toQuestionDtos(getAttemptQuestions(userExam));
    }

    private List<UserExamQuestion> findAttemptQuestionSnapshots(Long userExamId) {
        return userExamQuestionRepository.findWithQuestionDetailsByUserExamIds(List.of(userExamId));
    }

    private boolean isQuestionInAttempt(UserExam userExam, Long questionId) {
        if (userExamQuestionRepository == null) {
            return getAttemptQuestions(userExam).stream()
                    .anyMatch(question -> question.getQuestionId().equals(questionId));
        }
        if (userExamQuestionRepository.existsByUserExamUserExamId(userExam.getUserExamId())) {
            return userExamQuestionRepository.existsByUserExamUserExamIdAndQuestionQuestionId(
                    userExam.getUserExamId(),
                    questionId
            );
        }
        return getExamQuestionsIncludingDeleted(userExam.getExam().getExamId()).stream()
                .anyMatch(question -> question.getQuestionId().equals(questionId));
    }

    private List<Question> getExamQuestionsIncludingDeleted(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamIdIncludingDeleted(examId);
        if (questions != null && !questions.isEmpty()) {
            return questions;
        }
        return questionRepository.findQuestionsByExamId(examId);
    }

    private Exam findActiveExam(Long examId) {
        Exam exam = examRepository.findByExamIdAndDeletedFalse(examId)
                .or(() -> examRepository.findById(examId)
                        .filter(found -> !Boolean.TRUE.equals(found.getDeleted())))
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài thi"));
        if (exam.getSubject() != null && Boolean.TRUE.equals(exam.getSubject().getDeleted())) {
            throw new EntityNotFoundException("Không tìm thấy bài thi");
        }
        return exam;
    }
}
