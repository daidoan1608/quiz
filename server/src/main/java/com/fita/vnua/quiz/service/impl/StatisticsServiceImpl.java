package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.Question;
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
    public Map<String, Object> getStatistics(int hotSubjectsLimit, int wrongQuestionsLimit, int activeUsersLimit, int attemptsDays) {
        int safeHotSubjectsLimit = clamp(hotSubjectsLimit, 1, 50);
        int safeWrongQuestionsLimit = clamp(wrongQuestionsLimit, 1, 50);
        int safeActiveUsersLimit = clamp(activeUsersLimit, 1, 50);
        int safeAttemptsDays = clamp(attemptsDays, 1, 90);

        long subjectCount = subjectRepository.countByDeletedFalse();
        long questionCount = questionRepository.countByDeletedFalse();
        long userCount = userRepository.countByDeletedFalse();
        long examCount = examRepository.countByDeletedFalse();
        long questionCountByMedium = questionRepository.countByDifficulty(Question.Difficulty.MEDIUM);
        long questionCountByEasy = questionRepository.countByDifficulty(Question.Difficulty.EASY);
        long questionCountByHard = questionRepository.countByDifficulty(Question.Difficulty.HARD);

        Map<String, Object> stats = new HashMap<>();
        stats.put("questionCountByMedium", questionCountByMedium);
        stats.put("questionCountByEasy", questionCountByEasy);
        stats.put("questionCountByHard", questionCountByHard);
        stats.put("totalSubjects", subjectCount);
        stats.put("totalQuestions", questionCount);
        stats.put("totalUsers", userCount);
        stats.put("totalExams", examCount);
        stats.put("attemptsByDay", userExamRepository.countAttemptsByDay(LocalDate.now().minusDays(safeAttemptsDays - 1L).atStartOfDay()).stream()
                .map(row -> Map.of("date", String.valueOf(row[0]), "attempts", row[1]))
                .toList());
        stats.put("hotSubjects", userExamRepository.countAttemptsBySubject().stream()
                .limit(safeHotSubjectsLimit)
                .map(row -> Map.of("subjectName", row[0], "attempts", row[1]))
                .toList());
        stats.put("mostWrongQuestions", userAnswerRepository.findMostWrongQuestions().stream()
                .limit(safeWrongQuestionsLimit)
                .map(row -> Map.of("questionId", row[0], "content", row[1], "wrongCount", row[2]))
                .toList());
        stats.put("activeUsers", userExamRepository.findActiveUsersByAttemptCount().stream()
                .limit(safeActiveUsersLimit)
                .map(row -> Map.of("userId", row[0], "username", row[1], "fullName", row[2], "attempts", row[3], "lastAttemptAt", row[4]))
                .toList());

        return stats;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(value, max));
    }
}
