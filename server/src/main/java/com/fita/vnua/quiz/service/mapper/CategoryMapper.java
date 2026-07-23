package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.model.dto.CategorySummaryDto;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.entity.Category;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryMapper {
    public CategoryDto toDto(Category category) {
        return toDto(category, null);
    }

    public CategoryDto toDto(Category category, List<SubjectDto> subjects) {
        CategoryDto dto = new CategoryDto();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setCategoryDescription(category.getCategoryDescription());
        dto.setSubjects(subjects);
        copySoftDelete(category, dto);
        return dto;
    }

    public CategorySummaryDto toSummaryDto(Category category, Long totalSubjects) {
        CategorySummaryDto dto = new CategorySummaryDto();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setCategoryDescription(category.getCategoryDescription());
        dto.setTotalSubjects(totalSubjects == null ? 0L : totalSubjects);
        copySoftDelete(category, dto);
        return dto;
    }

    private void copySoftDelete(Category category, CategoryDto dto) {
        dto.setDeleted(category.getDeleted());
        dto.setDeletedAt(category.getDeletedAt());
        dto.setDeletedBy(category.getDeletedBy());
        dto.setDeletedCascadeId(category.getDeletedCascadeId());
        dto.setDeleteOriginType(category.getDeleteOriginType());
        dto.setDeleteOriginId(category.getDeleteOriginId());
    }

    private void copySoftDelete(Category category, CategorySummaryDto dto) {
        dto.setDeleted(category.getDeleted());
        dto.setDeletedAt(category.getDeletedAt());
        dto.setDeletedBy(category.getDeletedBy());
        dto.setDeletedCascadeId(category.getDeletedCascadeId());
        dto.setDeleteOriginType(category.getDeleteOriginType());
        dto.setDeleteOriginId(category.getDeleteOriginId());
    }
}
