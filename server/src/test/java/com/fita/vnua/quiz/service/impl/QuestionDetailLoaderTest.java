package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuestionDetailLoaderTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionDetailLoader questionDetailLoader;

    @Test
    void loadByIdsInSameOrderKeepsOriginalSelectionOrder() {
        Question first = question(1L);
        Question second = question(2L);
        Question third = question(3L);

        when(questionRepository.findWithDetailsByQuestionIds(List.of(3L, 1L, 2L)))
                .thenReturn(List.of(first, second, third));

        List<Question> questions = questionDetailLoader.loadByIdsInSameOrder(List.of(3L, 1L, 2L));

        assertThat(questions)
                .extracting(Question::getQuestionId)
                .containsExactly(3L, 1L, 2L);
    }

    private Question question(Long questionId) {
        Question question = new Question();
        question.setQuestionId(questionId);
        return question;
    }
}
