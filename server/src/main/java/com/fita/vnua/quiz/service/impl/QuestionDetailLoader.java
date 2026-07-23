package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class QuestionDetailLoader {
    private final QuestionRepository questionRepository;

    public List<Question> loadInSameOrder(List<Question> questions) {
        return loadByIdsInSameOrder(questions.stream()
                .map(Question::getQuestionId)
                .toList());
    }

    public List<Question> loadByIdsInSameOrder(List<Long> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            return List.of();
        }
        Map<Long, Question> questionsById = questionRepository.findWithDetailsByQuestionIds(questionIds).stream()
                .collect(Collectors.toMap(Question::getQuestionId, question -> question));
        return questionIds.stream()
                .map(questionsById::get)
                .filter(Objects::nonNull)
                .toList();
    }
}
