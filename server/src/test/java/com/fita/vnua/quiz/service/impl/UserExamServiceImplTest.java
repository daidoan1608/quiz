package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.request.StartExamAttemptRequest;
import com.fita.vnua.quiz.model.dto.request.UserExamRequest;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.entity.UserAnswer;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.repository.AnswerRepository;
import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.repository.UserExamQuestionRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import com.fita.vnua.quiz.service.mapper.UserExamMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserExamServiceImplTest {

    @Mock
    private UserExamRepository userExamRepository;
    @Mock
    private UserAnswerRepository userAnswerRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ExamRepository examRepository;
    @Mock
    private AnswerRepository answerRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private UserExamQuestionRepository userExamQuestionRepository;
    @Mock
    private UserExamAttemptStatsService attemptStatsService;
    @Spy
    private UserExamMapper userExamMapper = new UserExamMapper(new ObjectMapper(), new QuestionMapper());

    @InjectMocks
    private UserExamServiceImpl userExamService;

    @Test
    void getUserExamByIdForUserRejectsAttemptOwnedByAnotherUser() {
        UUID currentUserId = UUID.randomUUID();
        when(userExamRepository.findByIdAndUserId(10L, currentUserId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userExamService.getUserExamByIdForUser(10L, currentUserId))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Bạn không có quyền thực hiện thao tác này");
    }

    @Test
    void startOrResumeAttemptUsesAuthenticatedUserFromSecurityContext() {
        UUID authenticatedUserId = UUID.randomUUID();
        Long examId = 99L;

        StartExamAttemptRequest request = new StartExamAttemptRequest();
        request.setExamId(examId);

        User authenticatedUser = new User();
        authenticatedUser.setUserId(authenticatedUserId);

        Exam exam = new Exam();
        exam.setExamId(examId);
        exam.setDuration(30);
        Subject subject = new Subject();
        subject.setSubjectId(7L);
        subject.setName("Math");
        exam.setSubject(subject);

        when(userExamRepository.findInProgressByUserIdAndExamId(authenticatedUserId, examId)).thenReturn(List.of());
        when(userRepository.findById(authenticatedUserId)).thenReturn(Optional.of(authenticatedUser));
        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(userExamRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userAnswerRepository.findUserAnswersByUserExamId(any())).thenReturn(List.of());
        when(questionRepository.findQuestionsByExamId(examId)).thenReturn(List.of());

        userExamService.startOrResumeAttempt(request, authenticatedUserId);

        ArgumentCaptor<com.fita.vnua.quiz.model.entity.UserExam> savedAttempt =
                ArgumentCaptor.forClass(com.fita.vnua.quiz.model.entity.UserExam.class);
        verify(userExamRepository).save(savedAttempt.capture());
        assertThat(savedAttempt.getValue().getUser().getUserId()).isEqualTo(authenticatedUserId);
    }

    @Test
    @SuppressWarnings("deprecation")
    void createUserExamUsesAuthenticatedUserInsteadOfRequestUserId() {
        UUID authenticatedUserId = UUID.randomUUID();
        UUID spoofedUserId = UUID.randomUUID();
        Long examId = 99L;

        UserExamDto requestDto = new UserExamDto();
        requestDto.setUserId(spoofedUserId);
        requestDto.setExamId(examId);
        UserExamRequest request = new UserExamRequest(requestDto, List.of());

        User authenticatedUser = new User();
        authenticatedUser.setUserId(authenticatedUserId);

        Exam exam = new Exam();
        exam.setExamId(examId);

        when(userRepository.findById(authenticatedUserId)).thenReturn(Optional.of(authenticatedUser));
        when(examRepository.findById(examId)).thenReturn(Optional.of(exam));
        when(questionRepository.findQuestionsByExamId(examId)).thenReturn(List.of());
        when(userExamRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        userExamService.createUserExam(request, authenticatedUserId);

        ArgumentCaptor<UserExam> savedExam = ArgumentCaptor.forClass(UserExam.class);
        verify(userExamRepository).save(savedExam.capture());
        assertThat(savedExam.getValue().getUser().getUserId()).isEqualTo(authenticatedUserId);
    }

    @Test
    void getInProgressAttemptsHidesEmptyAttemptsCreatedByOpeningExamPage() {
        UUID userId = UUID.randomUUID();
        Long examId = 99L;

        UserExam emptyAttempt = buildAttempt(10L, examId, 0);
        UserExam movedWithoutAnswerAttempt = buildAttempt(11L, examId, 1);
        UserExam answeredAttempt = buildAttempt(12L, examId, 0);

        when(userExamRepository.findInProgressByUserId(userId))
                .thenReturn(List.of(emptyAttempt, movedWithoutAnswerAttempt, answeredAttempt));
        when(userAnswerRepository.findUserAnswersByUserExamId(10L)).thenReturn(List.of());
        when(userAnswerRepository.findUserAnswersByUserExamId(11L)).thenReturn(List.of());
        when(userAnswerRepository.findUserAnswersByUserExamId(12L)).thenReturn(List.of(buildUserAnswer(answeredAttempt)));
        when(questionRepository.findQuestionsByExamId(examId)).thenReturn(List.of());

        var attempts = userExamService.getInProgressAttempts(userId);

        assertThat(attempts).hasSize(1);
        assertThat(attempts.get(0).getUserExamId()).isEqualTo(12L);
        assertThat(emptyAttempt.getStatus()).isEqualTo("CANCELLED");
        assertThat(movedWithoutAnswerAttempt.getStatus()).isEqualTo("CANCELLED");
        verify(userExamRepository).save(emptyAttempt);
        verify(userExamRepository).save(movedWithoutAnswerAttempt);
    }

    private UserExam buildAttempt(Long userExamId, Long examId, Integer currentQuestionIndex) {
        Subject subject = new Subject();
        subject.setSubjectId(7L);
        subject.setName("Math");

        Exam exam = new Exam();
        exam.setExamId(examId);
        exam.setTitle("Sample exam");
        exam.setSubject(subject);

        UserExam userExam = new UserExam();
        userExam.setUserExamId(userExamId);
        userExam.setExam(exam);
        userExam.setStatus("IN_PROGRESS");
        userExam.setCurrentQuestionIndex(currentQuestionIndex);
        return userExam;
    }

    private UserAnswer buildUserAnswer(UserExam userExam) {
        Question question = new Question();
        question.setQuestionId(1L);

        com.fita.vnua.quiz.model.entity.Answer answer = new com.fita.vnua.quiz.model.entity.Answer();
        answer.setOptionId(1L);

        UserAnswer userAnswer = new UserAnswer();
        userAnswer.setUserExam(userExam);
        userAnswer.setQuestion(question);
        userAnswer.setAnswer(answer);
        return userAnswer;
    }
}
