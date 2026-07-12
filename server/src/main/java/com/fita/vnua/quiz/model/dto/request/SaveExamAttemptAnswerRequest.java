package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SaveExamAttemptAnswerRequest {
    private Long questionId;
    private Long answerId;
    private List<Long> answerIds;
    private Integer currentQuestionIndex;
    private Integer remainingTime;
}
