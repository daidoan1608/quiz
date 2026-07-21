package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamInfo {
    private Long examId;
    private String examCode;
    private String title;
    private String description;
    private Integer duration;
    private Long totalQuestions;
}
