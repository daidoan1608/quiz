package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategorySummaryDto {
    private Long categoryId;
    private String categoryName;
    private String categoryDescription;
    private long totalSubjects;
}
