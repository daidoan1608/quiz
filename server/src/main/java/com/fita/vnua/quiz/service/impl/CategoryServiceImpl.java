package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.model.dto.CategorySummaryDto;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.entity.Category;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.repository.CategoryRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final SubjectRepository subjectRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<CategorySummaryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapCategoryToSummaryDto)
                .toList();
    }

    @Override
    public List<CategorySummaryDto> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCategories();
        }
        return categoryRepository.findByCategoryNameContainingIgnoreCaseOrCategoryDescriptionContainingIgnoreCase(keyword.trim(), keyword.trim())
                .stream()
                .map(this::mapCategoryToSummaryDto)
                .toList();
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Category not found", HttpStatus.NOT_FOUND));
        CategoryDto categoryDto = modelMapper.map(category, CategoryDto.class);
        List<SubjectDto> subjectDtos = subjectRepository.findSubjectsByCategory(category).stream()
                .map(subject -> modelMapper.map(subject, SubjectDto.class))
                .toList();
        categoryDto.setSubjects(subjectDtos);
        return categoryDto;
    }

    @Override
    public CategoryDto addCategory(CategoryDto categoryDto) {
        Category category = modelMapper.map(categoryDto, Category.class);
        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryDto.class);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Category not found", HttpStatus.NOT_FOUND));
        category.setCategoryName((categoryDto.getCategoryName()));
        category.setCategoryDescription(categoryDto.getCategoryDescription());
        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryDto.class);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Category not found", HttpStatus.NOT_FOUND));
        categoryRepository.delete(category);
    }

    private CategorySummaryDto mapCategoryToSummaryDto(Category category) {
        CategorySummaryDto categoryDto = modelMapper.map(category, CategorySummaryDto.class);
        categoryDto.setTotalSubjects(subjectRepository.findSubjectsByCategory(category).size());
        return categoryDto;
    }
}
