package com.fita.vnua.quiz.service.impl;

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
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
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
    public UserExamResponse getUserExamById(Long id) {
        UserExam userExam = userExamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User exam not found with id: " + id));
        UserExamDto userExamDto = convertUserExamsToUserExamDto(userExam);
        List<UserAnswer> userAnswer = userAnswerRepository.findUserAnswersByUserExamId(id);
        List<UserAnswerDto> userAnswerDtos = new ArrayList<>();
        for (UserAnswer userAnswer1 : userAnswer) {
            UserAnswerDto userAnswerDto = new UserAnswerDto();
            userAnswerDto.setAnswerId(userAnswer1.getAnswer().getOptionId());
            userAnswerDto.setQuestionId(userAnswer1.getQuestion().getQuestionId());
            userAnswerDto.setUserExamId(userAnswer1.getUserExam().getUserExamId());
            userAnswerDtos.add(userAnswerDto);
        }
        SubjectDto subject = subjectService.getSubjectById(userExam.getExam().getSubject().getSubjectId());
        return UserExamResponse.builder()
                .userExamDto(userExamDto)
                .userAnswerDtos(userAnswerDtos)
                .subjectName(subject.getName())
                .title(userExam.getExam().getTitle())
                .build();
    }

    @Override
    @Transactional
    public UserExamDto createUserExam(UserExamRequest userExamRequest) {
        UserExamDto userExamDto = userExamRequest.getUserExamDto();
        List<UserAnswerDto> userAnswerDtos = userExamRequest.getUserAnswerDtos();

        User user = userRepository.findById(userExamDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userExamDto.getUserId()));
        Exam exam = examRepository.findById(userExamDto.getExamId())
                .orElseThrow(() -> new EntityNotFoundException("Exam not found with id: " + userExamDto.getExamId()));

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
    public List<UserExamResponse> getAllUserExams() {
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
            SubjectDto subject = subjectService.getSubjectById(userExam.getExam().getSubject().getSubjectId());
            UserExamResponse userExamResponse = UserExamResponse
                    .builder()
                    .userExamDto(convertUserExamsToUserExamDto(userExam))
                    .subjectName(subject.getName())
                    .title(userExam.getExam().getTitle())
                    .build();
            userExamResponses.add(userExamResponse);
        }
        return userExamResponses;
    }

    @Override
    @Transactional
    public ExamAttemptResponse startOrResumeAttempt(StartExamAttemptRequest request) {
        List<UserExam> existingAttempts = userExamRepository.findInProgressByUserIdAndExamId(request.getUserId(), request.getExamId());
        if (!existingAttempts.isEmpty()) {
            return buildAttemptResponse(existingAttempts.get(0));
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new EntityNotFoundException("Exam not found with id: " + request.getExamId()));

        UserExam userExam = new UserExam();
        userExam.setUser(user);
        userExam.setExam(exam);
        userExam.setStartTime(LocalDateTime.now());
        userExam.setStatus("IN_PROGRESS");
        userExam.setRemainingTime(exam.getDuration() == null ? null : exam.getDuration() * 60);
        userExam.setCurrentQuestionIndex(0);
        userExam.setUpdatedAt(LocalDateTime.now());

        return buildAttemptResponse(userExamRepository.save(userExam));
    }

    @Override
    public List<ExamAttemptResponse> getInProgressAttempts(UUID userId) {
        return userExamRepository.findInProgressByUserId(userId).stream()
                .map(this::buildAttemptResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExamAttemptResponse saveAttemptAnswer(Long userExamId, SaveExamAttemptAnswerRequest request) {
        UserExam userExam = getInProgressUserExam(userExamId);
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + request.getQuestionId()));

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
    public ExamAttemptResponse updateAttemptProgress(Long userExamId, UpdateExamAttemptProgressRequest request) {
        UserExam userExam = getInProgressUserExam(userExamId);
        updateAttemptProgressFields(userExam, request.getCurrentQuestionIndex(), request.getRemainingTime());
        return buildAttemptResponse(userExamRepository.save(userExam));
    }

    @Override
    @Transactional
    public UserExamDto submitAttempt(Long userExamId) {
        UserExam userExam = getInProgressUserExam(userExamId);
        List<Question> questions = questionRepository.findQuestionsByExamId(userExam.getExam().getExamId());
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
                .filter(Answer::getIsCorrect)
                .map(Answer::getOptionId)
                .collect(Collectors.toSet());
        return !correctAnswerIds.isEmpty() && correctAnswerIds.equals(chosenAnswerIds);
    }

    private UserExam getInProgressUserExam(Long userExamId) {
        UserExam userExam = userExamRepository.findById(userExamId)
                .orElseThrow(() -> new EntityNotFoundException("User exam not found with id: " + userExamId));
        if (!"IN_PROGRESS".equals(userExam.getStatus())) {
            throw new IllegalStateException("Attempt is not in progress");
        }
        return userExam;
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
        int totalQuestions = questionRepository.findQuestionsByExamId(userExam.getExam().getExamId()).size();

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
                .answeredCount(answers.size())
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
        return userExamDto;
    }
}
