package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.AuditLogService;
import com.fita.vnua.quiz.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "Exam API", description = "API cho các chức năng liên quan đến bài thi")
public class ExamController {
    private final ExamService examService;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#examRequest.examDto.subjectId, 'Subject', 'CREATE')")
    @PostMapping("admin/exams")
    @Operation(summary = "Tạo bài thi")
    public ResponseEntity<ApiResponse<ExamDto>> createExam(
            @RequestBody ExamRequest examRequest,
            @AuthenticationPrincipal User currentUser
    ) {
        ExamDto createdExam = examService.createExam(examRequest, currentUser.getUserId());
        auditLogService.record("CREATE", "EXAM", createdExam.getExamId(), currentUser, createdExam.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Tạo bài thi thành công", createdExam));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/exams/filter")
    @Operation(summary = "Lọc bài thi cho admin")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> filterExams(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) java.util.UUID createdBy,
            @RequestParam(required = false) Boolean deleted,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lọc bài thi thành công",
                examService.filterExams(keyword, categoryId, subjectId, createdBy, deleted, sortBy, sortDir)
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/exams/page")
    @Operation(summary = "Lọc bài thi cho admin có phân trang")
    public ResponseEntity<ApiResponse<Page<ExamSummaryDto>>> filterExamsPage(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) java.util.UUID createdBy,
            @RequestParam(required = false) Boolean deleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lọc bài thi thành công",
                examService.filterExamsPage(keyword, categoryId, subjectId, createdBy, deleted, page, size, sortBy, sortDir)
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/exams/deleted")
    @Operation(summary = "Lấy danh sách bài thi đã xóa mềm")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> getDeletedExams() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài thi đã xóa thành công", examService.getDeletedExams()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/exams")
    @Operation(summary = "Lấy danh sách bài thi")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> getAllExams() {
        List<ExamSummaryDto> exams = examService.getAllExams();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài thi thành công", exams));
    }

    @GetMapping("public/exams/subject/{subjectId}")
    @Operation(summary = "Lấy danh sách bài thi theo Id môn (public)")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> getExamsBySubjectId(@PathVariable("subjectId") Long subjectId) {
        List<ExamSummaryDto> exams = examService.getExamsBySubjectId(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài thi theo môn học thành công", exams));
    }

    @GetMapping("public/exams/{examId}")
    @Operation(summary = "Lấy bài thi theo Id bài thi(public)")
    public ResponseEntity<ApiResponse<ExamDto>> getExamById(
            @PathVariable("examId") Long examId,
            @RequestParam(defaultValue = "false") boolean includeCorrectAnswers,
            @RequestParam(required = false) Long userExamId,
            @AuthenticationPrincipal User currentUser
    ) {
        User authenticatedUser = includeCorrectAnswers ? authorizationService.requireAuthenticated(currentUser) : currentUser;
        ExamDto exam = examService.getPublicExamById(
                examId,
                includeCorrectAnswers,
                userExamId,
                authenticatedUser == null ? null : authenticatedUser.getUserId(),
                authenticatedUser != null && authorizationService.isAdminOrMod(authenticatedUser)
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin bài thi thành công", exam));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#examId, 'Exam', 'UPDATE')")
    @PutMapping("admin/exams/{examId}")
    @Operation(summary = "Cập nhật bài thi")
    public ResponseEntity<ApiResponse<ExamDto>> updateExam(@PathVariable("examId") Long examId, @RequestBody ExamDto examDto, @AuthenticationPrincipal User currentUser) {
        ExamDto updatedExam = examService.updateExam(examId, examDto);
        auditLogService.record("UPDATE", "EXAM", examId, currentUser, updatedExam.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bài thi thành công", updatedExam));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#examId, 'Exam', 'DELETE')")
    @DeleteMapping("admin/exams/{examId}")
    @Operation(summary = "Xóa bài thi")
    public ResponseEntity<ApiResponse<Object>> deleteExam(@PathVariable("examId") Long examId, @AuthenticationPrincipal User currentUser) {
        examService.deleteExam(examId);
        auditLogService.record("DELETE", "EXAM", examId, currentUser, "Soft delete exam");
        return ResponseEntity.ok(ApiResponse.success("Xóa bài thi thành công", null));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#examId, 'Exam', 'UPDATE')")
    @PatchMapping("admin/exams/{examId}/restore")
    @Operation(summary = "Khôi phục bài thi đã xóa mềm")
    public ResponseEntity<ApiResponse<ExamDto>> restoreExam(@PathVariable("examId") Long examId) {
        return ResponseEntity.ok(ApiResponse.success("Khôi phục bài thi thành công", examService.restoreExam(examId)));
    }
}
