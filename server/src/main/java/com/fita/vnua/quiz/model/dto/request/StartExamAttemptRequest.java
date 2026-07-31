package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartExamAttemptRequest {
    @NotNull(message = "Đề thi không được để trống")
    private Long examId;
}
