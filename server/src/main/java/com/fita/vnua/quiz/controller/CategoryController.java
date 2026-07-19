package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.model.dto.CategorySummaryDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
                "Lấy danh sách danh mục thành công",
                categoryService.getAllCategories()
        ));
    }

    @GetMapping("public/categories/search")
    @Operation(summary = "Tìm kiếm danh mục theo tên hoặc mô tả")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> searchCategories(@RequestParam("q") String keyword) {
        return ResponseEntity.ok(ApiResponse.success(
                "Tìm kiếm danh mục thành công",
                categoryService.searchCategories(keyword)
        ));
    }

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'CATEGORY', 'VIEW', 'GLOBAL', null)")
    @GetMapping("admin/categories/filter")
    @Operation(summary = "Lọc danh mục cho admin")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> filterCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean deleted,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lọc danh mục thành công",
                categoryService.filterCategories(keyword, deleted, sortBy, sortDir)
        ));
    }

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'CATEGORY', 'VIEW', 'GLOBAL', null)")
    @GetMapping("admin/categories/deleted")
    @Operation(summary = "Lấy danh sách danh mục đã xóa mềm")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> getDeletedCategories() {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách danh mục đã xóa thành công",
                categoryService.getDeletedCategories()
        ));
    }

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'CATEGORY', 'VIEW', 'GLOBAL', null)")
    @GetMapping("admin/categories/{id}")
    @Operation(summary = "Lấy danh mục theo Id (admin)")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin danh mục thành công",
                categoryService.getCategoryById(id)
        ));
    }

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'CATEGORY', 'CREATE', 'GLOBAL', null)")
    @PostMapping("admin/categories")
    @Operation(summary = "Thêm danh mục (admin)")
    public ResponseEntity<ApiResponse<CategoryDto>> addCategory(@RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thêm danh mục thành công",
                categoryService.addCategory(categoryDto)
        ));
    }

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'CATEGORY', 'UPDATE', 'GLOBAL', null)")
    @PutMapping("admin/categories/{id}")
    @Operation(summary = "Cập nhật danh mục (admin)")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable("id") Long id,
            @RequestBody CategoryDto categoryDto
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật danh mục thành công",
                categoryService.updateCategory(id, categoryDto)
        ));
    }

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'CATEGORY', 'DELETE', 'GLOBAL', null)")
    @DeleteMapping("admin/categories/{id}")
    @Operation(summary = "Xóa danh mục (admin)")
    public ResponseEntity<ApiResponse<Object>> deleteCategory(@PathVariable("id") Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }

    @PreAuthorize("@adminCapabilityService.hasPermission(principal, 'CATEGORY', 'RESTORE', 'GLOBAL', null)")
    @PatchMapping("admin/categories/{id}/restore")
    @Operation(summary = "Khôi phục danh mục đã xóa mềm")
    public ResponseEntity<ApiResponse<CategoryDto>> restoreCategory(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Khôi phục danh mục thành công",
                categoryService.restoreCategory(id)
        ));
    }
}
