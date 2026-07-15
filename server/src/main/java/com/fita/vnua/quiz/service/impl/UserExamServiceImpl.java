package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.SaveExamAttemptAnswerRequest;
import com.fita.vnua.quiz.model.dto.request.StartExamAttemptRequest;
import com.fita.vnua.quiz.model.dto.request.UpdateExamAttemptProgressRequest;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.dto.response.ExamAttemptResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.SubjectService;
import com.fita.vnua.quiz.service.UserExamService;
import com.fita.vnua.quiz.exception.CustomApiException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserExamServiceImpl implements UserExamService {
    private final UserExamRepository userExamRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserExamQuestionRepository userExamQuestionRepository;
    private final ModelMapper modelMapper;
    private final SubjectService subjectService;

    @Override
    public List<UserExamSummaryDto> getUserExamSummaries(LocalDateTime fromDate, LocalDateTime toDate) {
        List<UserExamRepository.UserExamSummaryProjection> projections = userExamRepository.getUserExamSummaries(fromDate, toDate);

        // Chuyển projection sang DTO
        return projections.stream().map(proj -> {
            UserExamSummaryDto dto = new UserExamSummaryDto();
            dto.setUserId(bytesToUUID(proj.getUserId()));
            dto.setUsername(proj.getUsername());
            dto.setAvatarUrl(proj.getAvatarUrl());
            dto.setAttemptCount(proj.getAttemptCount());
            dto.setAvgScore(proj.getAvgScore());
            dto.setTotalScore(proj.getTotalScore());
            dto.setTotalDurationSeconds(proj.getTotalDurationSeconds());
            dto.setSubjectName(proj.getSubjects());
            return dto;
        }).collect(Collectors.toList());
    }

    protected UUID bytesToUUID(byte[] bytes) {
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long high = bb.getLong();
        long low = bb.getLong();
        return new UUID(high, low);
    }

    @Override
    public UserExamResponse getUserExamByIdForUser(Long id, UUID currentUserId) {
        UserExam userExam = getUserExamForCurrentUser(id, currentUserId);
        return buildUserExamResponse(userExam);
    }

    @Override
    public UserExamResponse getUserExamByIdForAdmin(Long id) {
        UserExam userExam = userExamRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("User exam not found", HttpStatus.NOT_FOUND));
        return buildUserExamResponse(userExam);
    }

    private UserExamResponse buildUserExamResponse(UserExam userExam) {
        UserExamDto userExamDto = convertUserExamsToUserExamDto(userExam);
        List<UserAnswer> userAnswer = userAnswerRepository.findUserAnswersByUserExamId(userExam.getUserExamId());
        List<UserAnswerDto> userAnswerDtos = new ArrayList<>();
        for (UserAnswer userAnswer1 : userAnswer) {
            UserAnswerDto userAnswerDto = new UserAnswerDto();
            userAnswerDto.setAnswerId(userAnswer1.getAnswer().getOptionId());
            userAnswerDto.setQuestionId(userAnswer1.getQuestion().getQuestionId());
            userAnswerDto.setUserExamId(userAnswer1.getUserExam().getUserExamId());
            userAnswerDtos.add(userAnswerDto);
        }
        return UserExamResponse.builder()
                .userExamDto(userExamDto)
                .userAnswerDtos(userAnswerDtos)
                .subjectName(userExam.getExam().getSubject().getName())
                .title(userExam.getExam().getTitle())
                .username(userExam.getUser().getUsername())
                .fullName(userExam.getUser().getFullName())
                .questions(getAttemptQuestions(userExam).stream().map(this::mapQuestionToDto).toList())
                .build();
    }

    @Override
    @Transactional
    public UserExamDto createUserExam(UserExamRequest userExamRequest, UUID currentUserId) {
        UserExamDto userExamDto = userExamRequest.getUserExamDto();
        List<UserAnswerDto> userAnswerDtos = userExamRequest.getUserAnswerDtos();

        if (currentUserId == null) {
            throw new CustomApiException("Access denied", HttpStatus.UNAUTHORIZED);
        }
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + currentUserId));
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

            Answer answer = answerRepository.findById(userAnswerDto.getAnswerId())
                    .orElseThrow(() -> new EntityNotFoundException("Answer not found with id: " + userAnswerDto.getAnswerId()));
            userAnswer.setAnswer(answer);

            Question question = questionRepository.findById(userAnswerDto.getQuestionId())
                    .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + userAnswerDto.getQuestionId()));
            userAnswer.setQuestion(question);

            userAnswerRepository.save(userAnswer);
        }
        return modelMapper.map(savedUserExam, UserExamDto.class);
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
    public List<UserExamResponse> getAllUserExamsForAdmin() {
        List<UserExam> userExams = userExamRepository.findAll();
        return getUserExamResponses(userExams);
    }

    @Override
    public List<UserExamResponse> getExamsByUserAndSubject(UUID userId, Long subjectId) {
        List<UserExam> userExams = userExamRepository.findUserExamsByUserIdAndSubjectId(userId, subjectId);
        return getUserExamResponses(userExams);
    }

    @Override
    public List<UserExamResponse> getLast7ExamsByUser(UUID userId) {
        List<UserExam> userExams = userExamRepository.findLast7ExamsByUser(userId);
        return getUserExamResponses(userExams);
    }

    private List<UserExamResponse> getUserExamResponses(List<UserExam> userExams) {
        List<UserExamResponse> userExamResponses = new ArrayList<>();
        for (UserExam userExam : userExams) {
            UserExamResponse userExamResponse = UserExamResponse
                    .builder()
                    .userExamDto(convertUserExamsToUserExamDto(userExam))
                    .subjectName(userExam.getExam().getSubject().getName())
                    .title(userExam.getExam().getTitle())
                    .username(userExam.getUser().getUsername())
                    .fullName(userExam.getUser().getFullName())
                    .build();
            userExamResponses.add(userExamResponse);
        }
        return userExamResponses;
    }

    @Override
    @Transactional
    public synchronized ExamAttemptResponse startOrResumeAttempt(StartExamAttemptRequest request, UUID currentUserId) {
        if (currentUserId == null) {
            throw new CustomApiException("Access denied", HttpStatus.UNAUTHORIZED);
        }
        List<UserExam> existingAttempts = userExamRepository.findInProgressByUserIdAndExamId(currentUserId, request.getExamId());
        if (!existingAttempts.isEmpty()) {
            UserExam latestAttempt = existingAttempts.get(0);
            closeDuplicatedInProgressAttempts(existingAttempts, latestAttempt);
            return buildAttemptResponse(latestAttempt);
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + currentUserId));
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
        saveAttemptQuestionSnapshot(savedAttempt, questionRepository.findQuestionsByExamId(exam.getExamId()));
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
        UserExam userExam = getInProgressUserExam(userExamId, currentUserId);
        return saveAttemptAnswerInternal(userExam, userExamId, request);
    }

    private ExamAttemptResponse saveAttemptAnswerInternal(UserExam userExam, Long userExamId, SaveExamAttemptAnswerRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + request.getQuestionId()));
        if (getAttemptQuestions(userExam).stream().noneMatch(q -> q.getQuestionId().equals(question.getQuestionId()))) {
            throw new CustomApiException("Question is not part of this attempt", HttpStatus.BAD_REQUEST);
        }

        List<Long> answerIds = request.getAnswerIds() != null ? request.getAnswerIds() : new ArrayList<>();
        if (answerIds.isEmpty() && request.getAnswerId() != null) {
            answerIds.add(request.getAnswerId());
        }

        userAnswerRepository.deleteByUserExamIdAndQuestionId(userExamId, request.getQuestionId());
        for (Long answerId : new HashSet<>(answerIds)) {
            Answer answer = answerRepository.findById(answerId)
                    .orElseThrow(() -> new EntityNotFoundException("Answer not found with id: " + answerId));
            UserAnswer userAnswer = new UserAnswer();
            userAnswer.setUserExam(userExam);
            userAnswer.setQuestion(question);
            userAnswer.setAnswer(answer);
            userAnswerRepository.save(userAnswer);
        }

        updateAttemptProgressFields(userExam, request.getCurrentQuestionIndex(), request.getRemainingTime());
        return buildAttemptResponse(userExamRepository.save(userExam));
    }

    @Override
    @Transactional
    public ExamAttemptResponse updateAttemptProgress(Long userExamId, UpdateExamAttemptProgressRequest request, UUID currentUserId) {
        UserExam userExam = getInProgressUserExam(userExamId, currentUserId);
        updateAttemptProgressFields(userExam, request.getCurrentQuestionIndex(), request.getRemainingTime());
        return buildAttemptResponse(userExamRepository.save(userExam));
    }

    @Override
    @Transactional
    public UserExamDto submitAttempt(Long userExamId, UUID currentUserId) {
        UserExam userExam = getInProgressUserExam(userExamId, currentUserId);
        return submitAttemptInternal(userExam, userExamId);
    }

    @Override
    public List<Question> getAttemptQuestionsForSubmittedAttempt(Long userExamId, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomApiException("Access denied", HttpStatus.FORBIDDEN));
        UserExam userExam = (currentUser.getRole() == User.Role.ADMIN || currentUser.getRole() == User.Role.MOD)
                ? userExamRepository.findById(userExamId).orElseThrow(() -> new CustomApiException("Access denied", HttpStatus.FORBIDDEN))
                : getUserExamForCurrentUser(userExamId, currentUserId);
        if (!"SUBMITTED".equals(userExam.getStatus())) {
            throw new CustomApiException("Access denied", HttpStatus.FORBIDDEN);
        }
        return getAttemptQuestions(userExam);
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
        return convertUserExamsToUserExamDto(userExamRepository.save(userExam));
    }

    private boolean isQuestionCorrect(Question question, Set<Long> chosenAnswerIds) {
        if (chosenAnswerIds == null || chosenAnswerIds.isEmpty()) return false;

        Set<Long> correctAnswerIds = question.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .map(Answer::getOptionId)
                .collect(Collectors.toSet());
        if (correctAnswerIds.isEmpty()) return false;

        Question.QuestionType questionType = question.getQuestionType() != null
                ? question.getQuestionType()
                : Question.QuestionType.SINGLE_CHOICE;

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
            throw new IllegalStateException("Attempt is not in progress");
        }
        return userExam;
    }

    private UserExam getUserExamForCurrentUser(Long userExamId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new CustomApiException("Access denied", HttpStatus.UNAUTHORIZED);
        }
        return userExamRepository.findByIdAndUserId(userExamId, currentUserId)
                .orElseThrow(() -> new CustomApiException("Access denied", HttpStatus.FORBIDDEN));
    }

    private void updateAttemptProgressFields(UserExam userExam, Integer currentQuestionIndex, Integer remainingTime) {
        if (currentQuestionIndex != null) userExam.setCurrentQuestionIndex(currentQuestionIndex);
        if (remainingTime != null) userExam.setRemainingTime(Math.max(remainingTime, 0));
        userExam.setUpdatedAt(LocalDateTime.now());
    }

    private ExamAttemptResponse buildAttemptResponse(UserExam userExam) {
        List<UserAnswerDto> answers = userAnswerRepository.findUserAnswersByUserExamId(userExam.getUserExamId()).stream()
                .map(userAnswer -> {
                    UserAnswerDto dto = new UserAnswerDto();
                    dto.setUserAnswerId(userAnswer.getUserAnswerId());
                    dto.setUserExamId(userExam.getUserExamId());
                    dto.setQuestionId(userAnswer.getQuestion().getQuestionId());
                    dto.setAnswerId(userAnswer.getAnswer().getOptionId());
                    return dto;
                })
                .collect(Collectors.toList());
        int totalQuestions = getAttemptQuestions(userExam).size();

        return ExamAttemptResponse.builder()
                .userExamId(userExam.getUserExamId())
                .examId(userExam.getExam().getExamId())
                .subjectId(userExam.getExam().getSubject().getSubjectId())
                .title(userExam.getExam().getTitle())
                .subjectName(userExam.getExam().getSubject().getName())
                .status(userExam.getStatus())
                .startTime(userExam.getStartTime())
                .endTime(userExam.getEndTime())
                .updatedAt(userExam.getUpdatedAt())
                .remainingTime(userExam.getRemainingTime())
                .currentQuestionIndex(userExam.getCurrentQuestionIndex())
                .answeredCount((int) answers.stream().map(UserAnswerDto::getQuestionId).distinct().count())
                .totalQuestions(totalQuestions)
                .score(userExam.getScore())
                .userAnswerDtos(answers)
                .build();
    }

    protected UserExamDto convertUserExamsToUserExamDto(UserExam userExam) {
        UserExamDto userExamDto = new UserExamDto();
            userExamDto.setUserExamId(userExam.getUserExamId());
            userExamDto.setStartTime(userExam.getStartTime());
            userExamDto.setEndTime(userExam.getEndTime());
            userExamDto.setScore(userExam.getScore());
            userExamDto.setStatus(userExam.getStatus());
            userExamDto.setRemainingTime(userExam.getRemainingTime());
            userExamDto.setCurrentQuestionIndex(userExam.getCurrentQuestionIndex());
            userExamDto.setUserId(userExam.getUser().getUserId());
            userExamDto.setExamId(userExam.getExam().getExamId());
            populateAnswerStats(userExam, userExamDto);
        return userExamDto;
    }

    private void populateAnswerStats(UserExam userExam, UserExamDto userExamDto) {
        List<Question> questions = getAttemptQuestions(userExam);
        userExamDto.setTotalQuestions(questions.size());

        if (questions.isEmpty()) {
            userExamDto.setCorrectAnswers(0);
            return;
        }

        List<UserAnswer> userAnswers = userAnswerRepository.findUserAnswersByUserExamId(userExam.getUserExamId());
        Map<Long, Set<Long>> userAnswersMap = userAnswers.stream()
                .collect(Collectors.groupingBy(
                        ua -> ua.getQuestion().getQuestionId(),
                        Collectors.mapping(ua -> ua.getAnswer().getOptionId(), Collectors.toSet())
                ));

        int correctAnswers = 0;
        for (Question question : questions) {
            if (isQuestionCorrect(question, userAnswersMap.get(question.getQuestionId()))) {
                correctAnswers++;
            }
        }
        userExamDto.setCorrectAnswers(correctAnswers);
    }

    private void saveAttemptQuestionSnapshot(UserExam userExam, List<Question> questions) {
        if (userExamQuestionRepository == null) {
            return;
        }
        if (userExamQuestionRepository.existsByUserExamUserExamId(userExam.getUserExamId())) {
            return;
        }
        for (int i = 0; i < questions.size(); i++) {
            UserExamQuestion snapshot = new UserExamQuestion();
            snapshot.setUserExam(userExam);
            snapshot.setQuestion(questions.get(i));
            snapshot.setPosition(i);
            userExamQuestionRepository.save(snapshot);
        }
    }

    private List<Question> getAttemptQuestions(UserExam userExam) {
        if (userExamQuestionRepository == null) {
            return getExamQuestionsIncludingDeleted(userExam.getExam().getExamId());
        }
        List<UserExamQuestion> snapshots = userExamQuestionRepository.findByUserExamUserExamIdOrderByPositionAsc(userExam.getUserExamId());
        if (!snapshots.isEmpty()) {
            return snapshots.stream().map(UserExamQuestion::getQuestion).toList();
        }
        return getExamQuestionsIncludingDeleted(userExam.getExam().getExamId());
    }

    private List<Question> getExamQuestionsIncludingDeleted(Long examId) {
        List<Question> questions = questionRepository.findQuestionsByExamIdIncludingDeleted(examId);
        if (questions != null && !questions.isEmpty()) {
            return questions;
        }
        return questionRepository.findQuestionsByExamId(examId);
    }

    private QuestionDto mapQuestionToDto(Question question) {
        QuestionDto dto = modelMapper.map(question, QuestionDto.class);
        dto.setQuestionType(question.getQuestionType() == null ? null : question.getQuestionType().name());
        dto.setDifficulty(question.getDifficulty() == null ? null : question.getDifficulty().name());
        if (question.getChapter() != null) {
            dto.setChapterId(question.getChapter().getChapterId());
            dto.setChapterName(question.getChapter().getName());
        }
        dto.setAnswers(question.getAnswers().stream().map(answer -> {
            AnswerDto answerDto = new AnswerDto();
            answerDto.setOptionId(answer.getOptionId());
            answerDto.setQuestionId(question.getQuestionId());
            answerDto.setContent(answer.getContent());
            answerDto.setIsCorrect(answer.getIsCorrect());
            return answerDto;
        }).toList());
        return dto;
    }

    private Exam findActiveExam(Long examId) {
        Exam exam = examRepository.findByExamIdAndDeletedFalse(examId)
                .or(() -> examRepository.findById(examId)
                        .filter(found -> !Boolean.TRUE.equals(found.getDeleted())))
                .orElseThrow(() -> new EntityNotFoundException("Exam not found with id: " + examId));
        if (exam.getSubject() != null && Boolean.TRUE.equals(exam.getSubject().getDeleted())) {
            throw new EntityNotFoundException("Exam not found with id: " + examId);
        }
        return exam;
    }
}
