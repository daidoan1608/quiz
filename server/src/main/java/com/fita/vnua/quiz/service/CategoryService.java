package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.CategoryDto;

import java.util.List;

public interface CategoryService {
    List<CategoryDto> getAllCategories();

    CategoryDto getCategoryById(Long id);

    CategoryDto addCategory(CategoryDto categoryDto);

    CategoryDto updateCategory(Long id, CategoryDto categoryDto);

    void deleteCategory(Long id);
}
