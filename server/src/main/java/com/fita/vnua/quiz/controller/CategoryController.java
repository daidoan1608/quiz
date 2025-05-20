package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name="Category API", description = "API cho các chức năng liên quan đến danh mục")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("public/categories")
    @Operation(summary = "Lấy danh sách danh mục (public)")
    public ResponseEntity<ApiResponse<?>> getAllCategories() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully", List.of(categoryService.getAllCategories())));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch categories", List.of(e.getMessage())));
        }
    }

    @GetMapping("admin/categories/{id}")
    @Operation(summary = "Lấy danh mục theo Id (admin)")
    public ResponseEntity<ApiResponse<?>> getCategoryById(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Category fetched successfully", categoryService.getCategoryById(id)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch category", List.of(e.getMessage())));
        }
    }

    @PostMapping("admin/categories")
    @Operation(summary = "Thêm danh mục (admin)")
    public ResponseEntity<ApiResponse<?>> addCategory(@RequestBody CategoryDto categoryDto) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Category added successfully", categoryService.addCategory(categoryDto)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to add category", List.of(e.getMessage())));
        }
    }

    @PutMapping("admin/categories/{id}")
    @Operation(summary = "Cập nhật danh mục (admin)")
    public ResponseEntity<ApiResponse<?>> updateCategory(@PathVariable("id") Long id, @RequestBody CategoryDto categoryDto) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Category updated successfully", categoryService.updateCategory(id, categoryDto)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update category", List.of(e.getMessage())));
        }
    }

    @DeleteMapping("admin/categories/{id}")
    @Operation(summary = "Xóa danh mục (admin)")
    public ResponseEntity<ApiResponse<?>> deleteCategory(@PathVariable("id") Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", "Deleted category with id: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete category", List.of(e.getMessage())));
        }
    }
}
