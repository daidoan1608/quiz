package com.fita.vnua.quiz.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
    private Boolean deleted;
    private LocalDateTime deletedAt;
    private UUID deletedBy;
    private UUID deletedCascadeId;
    private String deleteOriginType;
    private Long deleteOriginId;
}
