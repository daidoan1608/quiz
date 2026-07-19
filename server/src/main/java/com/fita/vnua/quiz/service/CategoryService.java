package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.model.dto.CategorySummaryDto;

import java.util.List;

public interface CategoryService {
    List<CategorySummaryDto> getAllCategories();

    List<CategorySummaryDto> getDeletedCategories();

    List<CategorySummaryDto> searchCategories(String keyword);

    List<CategorySummaryDto> filterCategories(String keyword, Boolean deleted, String sortBy, String sortDir);

    CategoryDto getCategoryById(Long id);

    CategoryDto addCategory(CategoryDto categoryDto);

    CategoryDto updateCategory(Long id, CategoryDto categoryDto);

    void deleteCategory(Long id);

    CategoryDto restoreCategory(Long id);
}
