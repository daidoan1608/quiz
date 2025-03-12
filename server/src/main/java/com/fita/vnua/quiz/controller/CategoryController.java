package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.CategoryDto;
import com.fita.vnua.quiz.service.impl.CategoryServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryServiceImpl categoryService;

    @GetMapping("public/categories")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("admin/categories/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping("admin/categories")
    public ResponseEntity<?> addCategory(CategoryDto categoryDto) {
        return ResponseEntity.ok(categoryService.addCategory(categoryDto));
    }

    @PutMapping("admin/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable("id") Long id, CategoryDto categoryDto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDto));
    }

    @DeleteMapping("admin/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Deleted category with id: " + id);
    }
}
