package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class CategorySummaryDto extends SoftDeleteMetadataDto {
    private Long categoryId;
    private String categoryName;
    private String categoryDescription;
    private long totalSubjects;
}
