package com.fita.vnua.quiz.service;

import java.time.LocalDateTime;
import java.util.Map;

public interface StatisticsService {
    Map<String, Object> getStatistics(
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
            int rankingLimit);
}
