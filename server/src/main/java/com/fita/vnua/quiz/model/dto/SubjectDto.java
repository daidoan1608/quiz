package com.fita.vnua.quiz.model.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubjectDto {
    private Long subjectId;
    private Long categoryId;
    private String name;
    private String description;
    private long totalChapters;
    private long totalExams;
    private long totalQuestions;
    private List<ChapterDto> chapters;
    private List<ExamInfo> exams;
}
