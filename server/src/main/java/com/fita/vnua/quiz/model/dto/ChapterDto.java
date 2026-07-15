package com.fita.vnua.quiz.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChapterDto {
    private Long chapterId;
    private String name;
    private Integer ChapterNumber;
    private Long subjectId;
    private Long countQuestion;
    private Boolean deleted;
    private LocalDateTime deletedAt;
    private UUID deletedBy;
    private UUID deletedCascadeId;
    private String deleteOriginType;
    private Long deleteOriginId;
}
