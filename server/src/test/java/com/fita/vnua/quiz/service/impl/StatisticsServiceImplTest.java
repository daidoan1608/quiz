package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.QuestionDifficulty;
import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private UserExamRepository userExamRepository;

    @Mock
    private UserAnswerRepository userAnswerRepository;

    @InjectMocks
    private StatisticsServiceImpl statisticsService;

    @Test
    void getStatisticsIncludesResultAnalyticsAndRates() {
        UUID userId = UUID.randomUUID();
        LocalDateTime lastAttemptAt = LocalDateTime.of(2026, 7, 25, 9, 0);

        when(subjectRepository.countByDeletedFalse()).thenReturn(2L);
        when(questionRepository.countByDeletedFalse()).thenReturn(10L);
        when(userRepository.countByDeletedFalse()).thenReturn(3L);
        when(examRepository.countByDeletedFalse()).thenReturn(4L);
        when(questionRepository.countByDifficulty(QuestionDifficulty.EASY)).thenReturn(3L);
        when(questionRepository.countByDifficulty(QuestionDifficulty.MEDIUM)).thenReturn(5L);
        when(questionRepository.countByDifficulty(QuestionDifficulty.HARD)).thenReturn(2L);
        when(userExamRepository.summarizeAttemptResults(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(new Object[]{new Object[]{2L, 2L, 33.0, 0L, 2L}});
        when(userExamRepository.countAttemptsByDay(any(LocalDateTime.class), isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.<Object[]>of(new Object[]{"2026-07-25", 4L}));
        when(userExamRepository.countAttemptsBySubject(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.<Object[]>of(new Object[]{"Math", 4L}));
        when(userExamRepository.findActiveUsersByAttemptCount(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.<Object[]>of(new Object[]{userId, "alice", "Alice", 4L, lastAttemptAt}));
        when(userExamRepository.scoreByExam(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.<Object[]>of(new Object[]{11L, "Midterm", "Math", 2L, 2L, 33.0}));
        when(userExamRepository.scoreBySubject(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.<Object[]>of(new Object[]{7L, "Math", 2L, 2L, 33.0}));
        when(userExamRepository.rankUsersByResults(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.<Object[]>of(new Object[]{userId, "alice", "Alice", 2L, 33.0, 66.0, lastAttemptAt}));
        when(userAnswerRepository.findMostWrongQuestionsForDashboard(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.<Object[]>of(new Object[]{101L, "2 + 2 = ?", "Math", 2L, 4L}));

        Map<String, Object> statistics = statisticsService.getStatistics(
                5, 5, 5, 14,
                null, null, null, null,
                5, 5, 5);

        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) statistics.get("summary");
        assertThat(summary)
                .containsEntry("totalAttempts", 2L)
                .containsEntry("submittedAttempts", 2L)
                .containsEntry("completionRate", 100.0)
                .containsEntry("averageScore", 33.0)
                .containsEntry("passRate", 0.0);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> wrongQuestions = (List<Map<String, Object>>) statistics.get("mostWrongQuestions");
        assertThat(wrongQuestions.get(0))
                .containsEntry("wrongCount", 2L)
                .containsEntry("attemptCount", 4L)
                .containsEntry("wrongRate", 50.0)
                .containsEntry("subjectName", "Math");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ranking = (List<Map<String, Object>>) statistics.get("ranking");
        assertThat(ranking.get(0))
                .containsEntry("userId", userId)
                .containsEntry("attemptCount", 2L)
                .containsEntry("avgScore", 33.0)
                .containsEntry("totalScore", 66.0)
                .containsEntry("lastAttemptAt", lastAttemptAt);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> scoreByExam = (List<Map<String, Object>>) statistics.get("scoreByExam");
        assertThat(scoreByExam.get(0))
                .containsEntry("examId", 11L)
                .containsEntry("submittedAttempts", 2L)
                .containsEntry("averageScore", 33.0)
                .containsEntry("completionRate", 100.0);
    }
}
