package com.fita.vnua.quiz.model.dto;

import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class ChapterDto extends SoftDeleteMetadataDto {
    private Long chapterId;
    private String name;
    private Integer ChapterNumber;
    private Long subjectId;
    private Long countQuestion;
}
