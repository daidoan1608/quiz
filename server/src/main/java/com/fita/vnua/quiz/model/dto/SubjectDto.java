package com.fita.vnua.quiz.model.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubjectDto {
    private Long subjectId;
    private String name;
    private String description;
    private List<ChapterDto> chapters;
}
