package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteDto {
    private UUID userId;
    private Long subjectId;
    private String subjectName;
}
