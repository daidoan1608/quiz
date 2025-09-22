package com.fita.vnua.quiz.model.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChapterDto {
    private Long chapterId;
    private String name;
    private Integer ChapterNumber;
    private Long subjectId;
    private Long countQuestion;
}
