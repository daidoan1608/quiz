package com.fita.vnua.quiz.service;

import java.util.Map;

public interface StatisticsService {
    Map<String, Object> getStatistics(int hotSubjectsLimit, int wrongQuestionsLimit, int activeUsersLimit, int attemptsDays);
}
