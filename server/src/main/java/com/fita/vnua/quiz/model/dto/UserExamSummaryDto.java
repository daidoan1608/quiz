package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserExamSummaryDto {
    private UUID userId;
    private String username;
    private Long attemptCount;
    private Double avgScore;
    private Double totalScore;
    private Long totalDurationSeconds;
    private String subjectName;
}
