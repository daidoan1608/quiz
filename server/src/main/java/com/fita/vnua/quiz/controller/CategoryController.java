package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.model.dto.CategorySummaryDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "Category API", description = "API cho các chức năng liên quan đến danh mục")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("public/categories")
    @Operation(summary = "Lấy danh sách danh mục (public)")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(
                "Categories fetched successfully",
                categoryService.getAllCategories()
        ));
    }

    @GetMapping("public/categories/search")
    @Operation(summary = "Tìm kiếm danh mục theo tên hoặc mô tả")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> searchCategories(@RequestParam("q") String keyword) {
        return ResponseEntity.ok(ApiResponse.success(
                "Categories searched successfully",
                categoryService.searchCategories(keyword)
        ));
    }

    @GetMapping("admin/categories/{id}")
    @Operation(summary = "Lấy danh mục theo Id (admin)")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Category fetched successfully",
                categoryService.getCategoryById(id)
        ));
    }

    @PostMapping("admin/categories")
    @Operation(summary = "Thêm danh mục (admin)")
    public ResponseEntity<ApiResponse<CategoryDto>> addCategory(@RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(ApiResponse.success(
                "Category added successfully",
                categoryService.addCategory(categoryDto)
        ));
    }

    @PutMapping("admin/categories/{id}")
    @Operation(summary = "Cập nhật danh mục (admin)")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable("id") Long id,
            @RequestBody CategoryDto categoryDto
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Category updated successfully",
                categoryService.updateCategory(id, categoryDto)
        ));
    }

    @DeleteMapping("admin/categories/{id}")
    @Operation(summary = "Xóa danh mục (admin)")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
