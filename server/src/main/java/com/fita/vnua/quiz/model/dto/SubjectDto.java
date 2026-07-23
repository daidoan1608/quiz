package com.fita.vnua.quiz.model.dto;

import lombok.*;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class SubjectDto extends SoftDeleteMetadataDto {
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
