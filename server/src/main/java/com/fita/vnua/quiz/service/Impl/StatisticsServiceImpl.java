package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.ExamRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
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
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;

    @Override
    public Map<String, Object> getStatistics() {
        long subjectCount = subjectRepository.count();
        long questionCount = questionRepository.count();
        long userCount = userRepository.count();
        long examCount = examRepository.count();
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

        return stats;
    }
}
