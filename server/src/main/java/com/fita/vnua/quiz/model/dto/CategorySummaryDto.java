package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategorySummaryDto {
    private Long categoryId;
    private String categoryName;
    private String categoryDescription;
    private long totalSubjects;
    private Boolean deleted;
    private LocalDateTime deletedAt;
    private UUID deletedBy;
    private UUID deletedCascadeId;
    private String deleteOriginType;
    private Long deleteOriginId;
}
