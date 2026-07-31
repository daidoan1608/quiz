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
import com.fita.vnua.quiz.service.mapper.CategoryMapper;
import com.fita.vnua.quiz.service.mapper.SubjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final SubjectRepository subjectRepository;
    private final SoftDeleteService softDeleteService;
    private final CategoryMapper categoryMapper;
    private final SubjectMapper subjectMapper;

    @Override
    @Cacheable(value = "publicCategories", key = "'all'")
    public List<CategorySummaryDto> getAllCategories() {
        return mapCategoriesToSummaryDtos(categoryRepository.findByDeletedFalse());
    }

    @Override
    public List<CategorySummaryDto> getDeletedCategories() {
        return mapCategoriesToSummaryDtos(categoryRepository.findByDeletedTrue());
    }

    @Override
    public List<CategorySummaryDto> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCategories();
        }
        return mapCategoriesToSummaryDtos(categoryRepository.searchActive(keyword.trim()));
    }

    @Override
    public List<CategorySummaryDto> filterCategories(String keyword, Boolean deleted, String sortBy, String sortDir) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        List<CategorySummaryDto> categories = mapCategoriesToSummaryDtos(
                categoryRepository.filterCategories(normalizedKeyword, deleted)
        );
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
        List<SubjectDto> subjectDtos = subjectRepository.findSubjectsByCategoryAndDeletedFalse(category).stream()
                .map(subjectMapper::toDto)
                .toList();
        return categoryMapper.toDto(category, subjectDtos);
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail"}, allEntries = true)
    public CategoryDto addCategory(CategoryDto categoryDto) {
        validateUniqueCategoryName(categoryDto.getCategoryName(), null);
        Category category = new Category();
        category.setCategoryName(categoryDto.getCategoryName().trim());
        category.setCategoryDescription(categoryDto.getCategoryDescription());
        category.setDeleted(false);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail"}, allEntries = true)
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND);
        }
        validateUniqueCategoryName(categoryDto.getCategoryName(), id);
        category.setCategoryName(categoryDto.getCategoryName().trim());
        category.setCategoryDescription(categoryDto.getCategoryDescription());
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail"}, allEntries = true)
    public void deleteCategory(Long id) {
        softDeleteService.deleteCategory(id, null);
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail"}, allEntries = true)
    public CategoryDto restoreCategory(Long id) {
        softDeleteService.restoreCategory(id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        return categoryMapper.toDto(category);
    }

    private List<CategorySummaryDto> mapCategoriesToSummaryDtos(List<Category> categories) {
        List<Long> categoryIds = categories.stream()
                .map(Category::getCategoryId)
                .toList();
        if (categoryIds.isEmpty()) {
            return List.of();
        }
        Map<Long, Long> subjectCounts = categoryRepository.countActiveSubjectsByCategoryIds(categoryIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
        return categories.stream()
                .map(category -> mapCategoryToSummaryDto(category, subjectCounts))
                .toList();
    }

    private CategorySummaryDto mapCategoryToSummaryDto(Category category, Map<Long, Long> subjectCounts) {
        return categoryMapper.toSummaryDto(category, subjectCounts.getOrDefault(category.getCategoryId(), 0L));
    }

    private void validateUniqueCategoryName(String categoryName, Long currentCategoryId) {
        String normalizedName = categoryName == null ? "" : categoryName.trim();
        boolean duplicated = currentCategoryId == null
                ? categoryRepository.existsByCategoryNameIgnoreCaseAndDeletedFalse(normalizedName)
                : categoryRepository.existsByCategoryNameIgnoreCaseAndDeletedFalseAndCategoryIdNot(normalizedName, currentCategoryId);
        if (duplicated) {
            throw new CustomApiException("Tên danh mục đã tồn tại", HttpStatus.CONFLICT);
        }
    }
}
