package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.QuestionDifficulty;

import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final UserExamRepository userExamRepository;
    private final UserAnswerRepository userAnswerRepository;

    @Override
    public Map<String, Object> getStatistics(
            int hotSubjectsLimit,
            int wrongQuestionsLimit,
            int activeUsersLimit,
            int attemptsDays,
            Long subjectId,
            Long examId,
            LocalDateTime startedFrom,
            LocalDateTime startedTo,
            int examPerformanceLimit,
            int subjectPerformanceLimit,
            int rankingLimit) {
        int safeHotSubjectsLimit = clamp(hotSubjectsLimit, 1, 50);
        int safeWrongQuestionsLimit = clamp(wrongQuestionsLimit, 1, 50);
        int safeActiveUsersLimit = clamp(activeUsersLimit, 1, 50);
        int safeAttemptsDays = clamp(attemptsDays, 1, 90);
        int safeExamPerformanceLimit = clamp(examPerformanceLimit, 1, 50);
        int safeSubjectPerformanceLimit = clamp(subjectPerformanceLimit, 1, 50);
        int safeRankingLimit = clamp(rankingLimit, 1, 50);

        long subjectCount = subjectRepository.countByDeletedFalse();
        long questionCount = questionRepository.countByDeletedFalse();
        long userCount = userRepository.countByDeletedFalse();
        long examCount = examRepository.countByDeletedFalse();
        long questionCountByMedium = questionRepository.countByDifficulty(QuestionDifficulty.MEDIUM);
        long questionCountByEasy = questionRepository.countByDifficulty(QuestionDifficulty.EASY);
        long questionCountByHard = questionRepository.countByDifficulty(QuestionDifficulty.HARD);

        Map<String, Object> stats = new HashMap<>();
        stats.put("questionCountByMedium", questionCountByMedium);
        stats.put("questionCountByEasy", questionCountByEasy);
        stats.put("questionCountByHard", questionCountByHard);
        stats.put("totalSubjects", subjectCount);
        stats.put("totalQuestions", questionCount);
        stats.put("totalUsers", userCount);
        stats.put("totalExams", examCount);
        stats.put("summary", buildSummary(userExamRepository.summarizeAttemptResults(
                subjectId,
                examId,
                startedFrom,
                startedTo)));
        stats.put("attemptsByDay", userExamRepository.countAttemptsByDay(
                        LocalDate.now().minusDays(safeAttemptsDays - 1L).atStartOfDay(),
                        subjectId,
                        examId,
                        startedFrom,
                        startedTo).stream()
                .map(row -> row("date", String.valueOf(row[0]), "attempts", row[1]))
                .toList());
        stats.put("hotSubjects", userExamRepository.countAttemptsBySubject(subjectId, examId, startedFrom, startedTo).stream()
                .limit(safeHotSubjectsLimit)
                .map(row -> row("subjectName", row[0], "attempts", row[1]))
                .toList());
        stats.put("mostWrongQuestions", userAnswerRepository.findMostWrongQuestionsForDashboard(subjectId, examId, startedFrom, startedTo).stream()
                .limit(safeWrongQuestionsLimit)
                .map(this::mapWrongQuestion)
                .toList());
        stats.put("activeUsers", userExamRepository.findActiveUsersByAttemptCount(subjectId, examId, startedFrom, startedTo).stream()
                .limit(safeActiveUsersLimit)
                .map(row -> row("userId", row[0], "username", row[1], "fullName", row[2], "attempts", row[3], "lastAttemptAt", row[4]))
                .toList());
        stats.put("scoreByExam", userExamRepository.scoreByExam(subjectId, examId, startedFrom, startedTo).stream()
                .limit(safeExamPerformanceLimit)
                .map(this::mapScoreByExam)
                .toList());
        stats.put("scoreBySubject", userExamRepository.scoreBySubject(subjectId, examId, startedFrom, startedTo).stream()
                .limit(safeSubjectPerformanceLimit)
                .map(this::mapScoreBySubject)
                .toList());
        stats.put("ranking", userExamRepository.rankUsersByResults(subjectId, examId, startedFrom, startedTo).stream()
                .limit(safeRankingLimit)
                .map(this::mapRanking)
                .toList());

        return stats;
    }

    private Map<String, Object> buildSummary(Object[] row) {
        row = unwrapSingleAggregateRow(row);
        long totalAttempts = numberAt(row, 0).longValue();
        long submittedAttempts = numberAt(row, 1).longValue();
        double averageScore = numberAt(row, 2).doubleValue();
        long passedAttempts = numberAt(row, 3).longValue();
        long scoredAttempts = numberAt(row, 4).longValue();

        return row(
                "totalAttempts", totalAttempts,
                "submittedAttempts", submittedAttempts,
                "completionRate", rate(submittedAttempts, totalAttempts),
                "averageScore", round(averageScore),
                "passRate", rate(passedAttempts, scoredAttempts)
        );
    }

    private Object[] unwrapSingleAggregateRow(Object[] row) {
        if (row != null && row.length == 1 && row[0] instanceof Object[] nestedRow) {
            return nestedRow;
        }
        return row;
    }

    private Map<String, Object> mapScoreByExam(Object[] row) {
        long attempts = numberAt(row, 3).longValue();
        long submittedAttempts = numberAt(row, 4).longValue();
        return row(
                "examId", row[0],
                "examTitle", row[1],
                "subjectName", row[2],
                "attempts", attempts,
                "submittedAttempts", submittedAttempts,
                "averageScore", round(numberAt(row, 5).doubleValue()),
                "completionRate", rate(submittedAttempts, attempts)
        );
    }

    private Map<String, Object> mapScoreBySubject(Object[] row) {
        long attempts = numberAt(row, 2).longValue();
        long submittedAttempts = numberAt(row, 3).longValue();
        return row(
                "subjectId", row[0],
                "subjectName", row[1],
                "attempts", attempts,
                "submittedAttempts", submittedAttempts,
                "averageScore", round(numberAt(row, 4).doubleValue()),
                "completionRate", rate(submittedAttempts, attempts)
        );
    }

    private Map<String, Object> mapWrongQuestion(Object[] row) {
        long wrongCount = numberAt(row, 3).longValue();
        long attemptCount = numberAt(row, 4).longValue();
        return row(
                "questionId", row[0],
                "content", row[1],
                "subjectName", row[2],
                "wrongCount", wrongCount,
                "attemptCount", attemptCount,
                "wrongRate", rate(wrongCount, attemptCount)
        );
    }

    private Map<String, Object> mapRanking(Object[] row) {
        return row(
                "userId", row[0],
                "username", row[1],
                "fullName", row[2],
                "attemptCount", numberAt(row, 3).longValue(),
                "avgScore", round(numberAt(row, 4).doubleValue()),
                "totalScore", round(numberAt(row, 5).doubleValue()),
                "lastAttemptAt", row[6]
        );
    }

    private Number numberAt(Object[] row, int index) {
        Object value = row == null || index >= row.length ? null : row[index];
        return value instanceof Number number ? number : 0;
    }

    private double rate(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0;
        }
        return round(numerator * 100.0 / denominator);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private Map<String, Object> row(Object... pairs) {
        Map<String, Object> row = new LinkedHashMap<>();
        for (int i = 0; i + 1 < pairs.length; i += 2) {
            row.put(String.valueOf(pairs[i]), pairs[i + 1]);
        }
        return row;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(value, max));
    }
}
