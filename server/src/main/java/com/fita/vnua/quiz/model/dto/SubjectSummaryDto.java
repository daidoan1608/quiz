package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubjectSummaryDto {
    private Long subjectId;
    private Long categoryId;
    private String name;
    private String description;
    private long totalChapters;
    private long totalExams;
    private long totalQuestions;
    private Boolean deleted;
    private LocalDateTime deletedAt;
    private UUID deletedBy;
    private UUID deletedCascadeId;
    private String deleteOriginType;
    private Long deleteOriginId;
}
