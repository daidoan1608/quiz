package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.SubjectSummaryDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "Subject API", description = "API thực hiện các chức năng liên quan đến môn học")
public class SubjectController {
    private final SubjectService subjectService;
    private final AuthorizationService authorizationService;

    @GetMapping("public/subjects")
    @Operation(summary = "Lấy danh sách tất cả các môn học")
    public ResponseEntity<ApiResponse<List<SubjectSummaryDto>>> getAllSubject() {
        List<SubjectSummaryDto> subjects = subjectService.getAllSubject();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách môn học thành công", subjects));
    }

    @GetMapping("public/subjects/random")
    @Operation(summary = "Lấy danh sách môn học ngẫu nhiên")
    public ResponseEntity<ApiResponse<List<SubjectSummaryDto>>> getRandomSubjects(
            @RequestParam(defaultValue = "4") int limit
    ) {
        List<SubjectSummaryDto> subjects = subjectService.getRandomSubjects(limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách môn học ngẫu nhiên thành công", subjects));
    }

    @GetMapping("public/subjects/search")
    @Operation(summary = "Tìm kiếm môn học theo tên hoặc mô tả")
    public ResponseEntity<ApiResponse<List<SubjectSummaryDto>>> searchSubjects(@RequestParam("q") String keyword) {
        List<SubjectSummaryDto> subjects = subjectService.searchSubjects(keyword);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm môn học thành công", subjects));
    }

    @GetMapping("user/subjects")
    @Operation(summary = "Lấy các môn học mà user đã làm bài thi")
    public ResponseEntity<ApiResponse<List<SubjectSummaryDto>>> getSubjectsByUser(
            @RequestParam UUID userId,
            @AuthenticationPrincipal User currentUser
    ) {
        authorizationService.requireSelfOrAdminMod(userId, currentUser);
        List<SubjectSummaryDto> subjects = subjectService.getSubjectsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách môn học của người dùng thành công", subjects));
    }

    @GetMapping("public/subjects/category/{categoryId}")
    @Operation(summary = "Lấy danh sách môn học theo Id danh mục")
    public ResponseEntity<ApiResponse<List<SubjectSummaryDto>>> getSubjectByCategoryId(@PathVariable("categoryId") Long categoryId) {
        List<SubjectSummaryDto> subjects = subjectService.getSubjectsByCategoryId(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách môn học theo danh mục thành công", subjects));
    }

    @GetMapping("public/subjects/{subjectId}")
    @Operation(summary = "Lấy môn học theo Id môn học")
    public ResponseEntity<ApiResponse<SubjectDto>> getSubjectById(@PathVariable("subjectId") Long subjectId) {
        SubjectDto subject = subjectService.getSubjectById(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin môn học thành công", subject));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/subjects/filter")
    @Operation(summary = "Lọc môn học cho admin")
    public ResponseEntity<ApiResponse<List<SubjectSummaryDto>>> filterSubjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean deleted,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lọc môn học thành công",
                subjectService.filterSubjects(keyword, categoryId, deleted, sortBy, sortDir)
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/subjects/deleted")
    @Operation(summary = "Lấy danh sách môn học đã xóa mềm")
    public ResponseEntity<ApiResponse<List<SubjectSummaryDto>>> getDeletedSubjects() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách môn học đã xóa thành công", subjectService.getDeletedSubjects()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("admin/subjects")
    @Operation(summary = "Tạo môn học (admin)")
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(@RequestBody SubjectDto subjectDto) {
        SubjectDto createdSubject = subjectService.create(subjectDto);
        return ResponseEntity.ok(ApiResponse.success("Tạo môn học thành công", createdSubject));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#subjectId, 'Subject', 'UPDATE')")
    @PatchMapping("admin/subjects/{subjectId}")
    @Operation(summary = "Cập nhật môn học (admin)")
    public ResponseEntity<ApiResponse<SubjectDto>> updateSubject(
            @PathVariable("subjectId") Long subjectId,
            @RequestBody SubjectDto subjectDto
    ) {
        SubjectDto updatedSubject = subjectService.update(subjectId, subjectDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật môn học thành công", updatedSubject));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#subjectId, 'Subject', 'DELETE')")
    @DeleteMapping("admin/subjects/{subjectId}")
    @Operation(summary = "Xóa môn học (admin)")
    public ResponseEntity<ApiResponse<Object>> deleteSubject(@PathVariable("subjectId") Long subjectId) {
        subjectService.delete(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Xóa môn học thành công", null));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#subjectId, 'Subject', 'UPDATE')")
    @PatchMapping("admin/subjects/{subjectId}/restore")
    @Operation(summary = "Khôi phục môn học đã xóa mềm")
    public ResponseEntity<ApiResponse<SubjectDto>> restoreSubject(@PathVariable("subjectId") Long subjectId) {
        return ResponseEntity.ok(ApiResponse.success("Khôi phục môn học thành công", subjectService.restore(subjectId)));
    }
}
