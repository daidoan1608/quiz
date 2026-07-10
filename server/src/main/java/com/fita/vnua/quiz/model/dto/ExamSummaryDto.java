package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamSummaryDto {
    private Long examId;
    private Long subjectId;
    private String subjectName;
    private String title;
    private String description;
    private Integer duration;
    private UUID createdBy;
    private String createdDate;
    private Integer questionCount;
}
