package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class SubjectSummaryDto extends SoftDeleteMetadataDto {
    private Long subjectId;
    private Long categoryId;
    private String name;
    private String description;
    private long totalChapters;
    private long totalExams;
    private long totalQuestions;
}
