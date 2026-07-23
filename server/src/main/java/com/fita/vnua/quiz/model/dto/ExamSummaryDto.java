package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class ExamSummaryDto extends SoftDeleteMetadataDto {
    private Long examId;
    private String examCode;
    private Long subjectId;
    private String subjectName;
    private String title;
    private String description;
    private Integer duration;
    private UUID createdBy;
    private String createdDate;
    private Integer questionCount;
}
