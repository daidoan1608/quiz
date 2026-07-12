package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

@Data
public class UpdateExamAttemptProgressRequest {
    private Integer currentQuestionIndex;
    private Integer remainingTime;
}
