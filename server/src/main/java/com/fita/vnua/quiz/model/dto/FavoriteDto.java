package com.fita.vnua.quiz.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteDto {
    private UUID userId;
    @NotNull(message = "Môn học yêu thích không được để trống")
    private Long subjectId;
    private Long categoryId;
    private String subjectName;
}
