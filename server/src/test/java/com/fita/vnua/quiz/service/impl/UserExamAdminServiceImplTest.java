package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamQuestionRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.service.mapper.UserExamMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserExamAdminServiceImplTest {

    @Mock
    private UserExamRepository userExamRepository;
    @Mock
    private UserAnswerRepository userAnswerRepository;
    @Mock
    private UserExamQuestionRepository userExamQuestionRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private UserExamAttemptStatsService attemptStatsService;
    @Mock
    private UserExamMapper userExamMapper;

    @InjectMocks
    private UserExamAdminServiceImpl userExamAdminService;

    @Test
    void getAllUserExamsForAdminFiltersAndMapsResults() {
        Pageable pageable = PageRequest.of(0, 10);
        UserExam userExam = new UserExam();
        userExam.setUserExamId(1L);
        Page<UserExam> page = new PageImpl<>(List.of(userExam), pageable, 1);

        when(userExamRepository.filterForAdmin(eq("math"), eq(1L), eq(2L), any(), any(), eq(pageable)))
                .thenReturn(page);

        UserExamResponse responseDto = mock(UserExamResponse.class);
        when(userExamMapper.toAdminListResponse(userExam)).thenReturn(responseDto);

        Page<UserExamResponse> result = userExamAdminService.getAllUserExamsForAdmin(
                "  math  ", 1L, 2L, LocalDateTime.now().minusDays(1), LocalDateTime.now(), pageable
        );

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(responseDto);
    }

    @Test
    void getUserExamByIdForAdminThrowsWhenNotFound() {
        when(userExamRepository.findByIdWithExamSubjectAndUser(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userExamAdminService.getUserExamByIdForAdmin(999L))
                .isInstanceOf(CustomApiException.class)
                .hasMessageContaining("Không tìm thấy")
                .matches(e -> ((CustomApiException) e).getStatus() == HttpStatus.NOT_FOUND);
    }

    @Test
    void getUserExamByIdForAdminReturnsDetailWhenFound() {
        UserExam userExam = new UserExam();
        userExam.setUserExamId(10L);
        Exam exam = new Exam();
        exam.setExamId(5L);
        userExam.setExam(exam);

        when(userExamRepository.findByIdWithExamSubjectAndUser(10L)).thenReturn(Optional.of(userExam));
        when(userAnswerRepository.findUserAnswersByUserExamId(10L)).thenReturn(List.of());
        when(userExamQuestionRepository.findWithQuestionDetailsByUserExamIds(List.of(10L))).thenReturn(List.of());
        when(questionRepository.findQuestionsByExamIdIncludingDeleted(5L)).thenReturn(List.of());

        UserExamResponse expected = mock(UserExamResponse.class);
        when(userExamMapper.toDetailResponse(eq(userExam), any(), any(), any())).thenReturn(expected);

        UserExamResponse result = userExamAdminService.getUserExamByIdForAdmin(10L);
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expected);
    }
}