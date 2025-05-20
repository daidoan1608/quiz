package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name="Subject API", description = "API thực hiện các chức năng liên quan đến môn học")
public class SubjectController {
    private final SubjectService subjectService;

    @GetMapping("public/subjects")
    @Operation(summary = "Lấy danh sách tất cả các môn học")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getAllSubject() {
        try {
            List<SubjectDto> subjects = subjectService.getAllSubject();
            if (subjects.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No subject found", List.of("No subjects available")));
            }
            return ResponseEntity.ok(ApiResponse.success("Subjects fetched successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch subjects", List.of(e.getMessage())));
        }
    }

    @GetMapping("public/subjects/{subjectId}")
    @Operation(summary = "Lấy môn học theo Id môn học")
    public ResponseEntity<ApiResponse<SubjectDto>> getSubjectById(@PathVariable("subjectId") Long subjectId) {
        try {
            SubjectDto subject = subjectService.getSubjectById(subjectId);
            if (subject == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("No subject found", List.of("No subject found for the given ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("Subject fetched successfully", subject));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch subject", List.of(e.getMessage())));
        }
    }

    @PostMapping("admin/subjects")
    @Operation(summary = "Tạo môn học (admin)")
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(@RequestBody SubjectDto subjectDto) {
        try {
            SubjectDto createdSubject = subjectService.create(subjectDto);
            return ResponseEntity.ok(ApiResponse.success("Subject created successfully", createdSubject));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create subject", List.of(e.getMessage())));
        }
    }

    @PatchMapping("admin/subjects/{subjectId}")
    @Operation(summary = "Cập nhật môn học (admin)")
    public ResponseEntity<ApiResponse<SubjectDto>> updateSubject(@PathVariable("subjectId") Long subjectId, @RequestBody SubjectDto subjectDto) {
        try {
            SubjectDto updatedSubject = subjectService.update(subjectId, subjectDto);
            return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", updatedSubject));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update subject", List.of(e.getMessage())));
        }
    }

    @DeleteMapping("admin/subjects/{subjectId}")
    @Operation(summary = "Xóa môn học (admin)")
    public ResponseEntity<ApiResponse<Object>> deleteSubject(@PathVariable("subjectId") Long subjectId) {
        try {
            subjectService.delete(subjectId);
            return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", "Deleted subject with id: " + subjectId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete subject", List.of(e.getMessage())));
        }
    }
}
