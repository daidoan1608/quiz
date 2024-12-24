package com.fita.vnua.quiz.service.Impl;

import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;

    @Override
    public Map<String, Object> getStatistics() {
        long questionCount = questionRepository.count();
        long userCount = userRepository.count();
        long examCount = examRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQuestions", questionCount);
        stats.put("totalUsers", userCount);
        stats.put("totalExams", examCount);

        return stats;
    }
}
