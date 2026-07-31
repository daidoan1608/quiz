package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SaveExamAttemptAnswerRequest {
    @NotNull(message = "Câu hỏi không được để trống")
    private Long questionId;
    private Long answerId;
    private List<@NotNull(message = "ID đáp án không được để trống") Long> answerIds;
    @Min(value = 0, message = "Vị trí câu hỏi hiện tại không được âm")
    private Integer currentQuestionIndex;
    @Min(value = 0, message = "Thời gian còn lại không được âm")
    private Integer remainingTime;
}
