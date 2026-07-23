package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto extends SoftDeleteMetadataDto {
    private Long categoryId;

    private String categoryName;

    private String categoryDescription;

    private List<SubjectDto> subjects;
}
