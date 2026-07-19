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
import com.fita.vnua.quiz.service.SoftDeleteService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final SubjectRepository subjectRepository;
    private final ModelMapper modelMapper;
    private final SoftDeleteService softDeleteService;

    @Override
    public List<CategorySummaryDto> getAllCategories() {
        return categoryRepository.findByDeletedFalse().stream()
                .map(this::mapCategoryToSummaryDto)
                .toList();
    }

    @Override
    public List<CategorySummaryDto> getDeletedCategories() {
        return categoryRepository.findByDeletedTrue().stream()
                .map(this::mapCategoryToSummaryDto)
                .toList();
    }

    @Override
    public List<CategorySummaryDto> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCategories();
        }
        return categoryRepository.searchActive(keyword.trim())
                .stream()
                .map(this::mapCategoryToSummaryDto)
                .toList();
    }

    @Override
    public List<CategorySummaryDto> filterCategories(String keyword, Boolean deleted, String sortBy, String sortDir) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        List<CategorySummaryDto> categories = categoryRepository.filterCategories(normalizedKeyword, deleted).stream()
                .map(this::mapCategoryToSummaryDto)
                .toList();
        return AdminSortHelper.sort(categories, sortBy, sortDir, Map.of(
                "categoryId", CategorySummaryDto::getCategoryId,
                "categoryName", CategorySummaryDto::getCategoryName,
                "categoryDescription", CategorySummaryDto::getCategoryDescription,
                "totalSubjects", CategorySummaryDto::getTotalSubjects,
                "deletedAt", CategorySummaryDto::getDeletedAt
        ));
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND);
        }
        CategoryDto categoryDto = modelMapper.map(category, CategoryDto.class);
        List<SubjectDto> subjectDtos = subjectRepository.findSubjectsByCategoryAndDeletedFalse(category).stream()
                .map(subject -> modelMapper.map(subject, SubjectDto.class))
                .toList();
        categoryDto.setSubjects(subjectDtos);
        return categoryDto;
    }

    @Override
    public CategoryDto addCategory(CategoryDto categoryDto) {
        Category category = new Category();
        category.setCategoryName(categoryDto.getCategoryName());
        category.setCategoryDescription(categoryDto.getCategoryDescription());
        category.setDeleted(false);
        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryDto.class);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND);
        }
        category.setCategoryName((categoryDto.getCategoryName()));
        category.setCategoryDescription(categoryDto.getCategoryDescription());
        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryDto.class);
    }

    @Override
    public void deleteCategory(Long id) {
        softDeleteService.deleteCategory(id, null);
    }

    @Override
    public CategoryDto restoreCategory(Long id) {
        softDeleteService.restoreCategory(id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        return modelMapper.map(category, CategoryDto.class);
    }

    private CategorySummaryDto mapCategoryToSummaryDto(Category category) {
        CategorySummaryDto categoryDto = modelMapper.map(category, CategorySummaryDto.class);
        categoryDto.setTotalSubjects(subjectRepository.findSubjectsByCategoryAndDeletedFalse(category).size());
        return categoryDto;
    }
}
