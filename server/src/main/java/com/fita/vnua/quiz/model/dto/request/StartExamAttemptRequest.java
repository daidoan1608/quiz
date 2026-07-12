package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class StartExamAttemptRequest {
    private UUID userId;
    private Long examId;
}
