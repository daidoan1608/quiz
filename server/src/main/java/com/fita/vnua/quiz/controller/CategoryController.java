package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
public class CategoryController {
    private final CategoryService categoryService;

    // Lấy tất cả các danh mục (public)
    @GetMapping("public/categories")
    public ResponseEntity<ApiResponse<?>> getAllCategories() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully", List.of(categoryService.getAllCategories())));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch categories", List.of(e.getMessage())));
        }
    }

    // Lấy danh mục theo ID (admin)
    @GetMapping("admin/categories/{id}")
    public ResponseEntity<ApiResponse<?>> getCategoryById(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Category fetched successfully", categoryService.getCategoryById(id)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch category", List.of(e.getMessage())));
        }
    }

    // Thêm danh mục mới (admin)
    @PostMapping("admin/categories")
    public ResponseEntity<ApiResponse<?>> addCategory(@RequestBody CategoryDto categoryDto) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Category added successfully", categoryService.addCategory(categoryDto)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to add category", List.of(e.getMessage())));
        }
    }

    // Cập nhật danh mục (admin)
    @PutMapping("admin/categories/{id}")
    public ResponseEntity<ApiResponse<?>> updateCategory(@PathVariable("id") Long id, @RequestBody CategoryDto categoryDto) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Category updated successfully", categoryService.updateCategory(id, categoryDto)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update category", List.of(e.getMessage())));
        }
    }

    // Xóa danh mục (admin)
    @DeleteMapping("admin/categories/{id}")
    public ResponseEntity<ApiResponse<?>> deleteCategory(@PathVariable("id") Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", "Deleted category with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete category", List.of(e.getMessage())));
        }
    }
}
