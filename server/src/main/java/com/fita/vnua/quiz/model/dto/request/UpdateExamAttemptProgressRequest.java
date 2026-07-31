package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateExamAttemptProgressRequest {
    @Min(value = 0, message = "Vị trí câu hỏi hiện tại không được âm")
    private Integer currentQuestionIndex;
    @Min(value = 0, message = "Thời gian còn lại không được âm")
    private Integer remainingTime;
}
