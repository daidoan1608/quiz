package com.fita.vnua.quiz.model.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamDto {
    private Long examId;
    private Long subjectId;
    private String subjectName;
    private String title;
    private String description;
    private Integer duration;
    private UUID createdBy;
    private String createdDate;
    private List<QuestionDto> questions;
}
