package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ExamDto;
import com.fita.vnua.quiz.model.dto.ExamSummaryDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.UserExamResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.ExamService;
import com.fita.vnua.quiz.service.UserExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final UserExamService userExamService;
    private final AuthorizationService authorizationService;

    @PreAuthorize("hasPermission(#examRequest.examDto.subjectId, 'Subject', 'CREATE') or hasRole('ADMIN')")
    @PostMapping("admin/exams")
    @Operation(summary = "Tạo bài thi")
    public ResponseEntity<ApiResponse<ExamDto>> createExam(
            @RequestBody ExamRequest examRequest,
            @AuthenticationPrincipal User currentUser
    ) {
        ExamDto createdExam = examService.createExam(examRequest, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Exam created successfully", createdExam));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/exams")
    @Operation(summary = "Lấy danh sách bài thi")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> getAllExams() {
        List<ExamSummaryDto> exams = examService.getAllExams();
        return ResponseEntity.ok(ApiResponse.success("All exams fetched successfully", exams));
    }

    @GetMapping("public/exams/subject/{subjectId}")
    @Operation(summary = "Lấy danh sách bài thi theo Id môn (public)")
    public ResponseEntity<ApiResponse<List<ExamSummaryDto>>> getExamsBySubjectId(@PathVariable("subjectId") Long subjectId) {
        List<ExamSummaryDto> exams = examService.getExamsBySubjectId(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Exams fetched successfully", exams));
    }

    @GetMapping("public/exams/{examId}")
    @Operation(summary = "Lấy bài thi theo Id bài thi(public)")
    public ResponseEntity<ApiResponse<ExamDto>> getExamById(
            @PathVariable("examId") Long examId,
            @RequestParam(defaultValue = "false") boolean includeCorrectAnswers,
            @RequestParam(required = false) Long userExamId,
            @AuthenticationPrincipal User currentUser
    ) {
        ExamDto exam = examService.getExamById(examId);
        if (includeCorrectAnswers) {
            requireCorrectAnswerAccess(examId, userExamId, currentUser);
        } else {
            stripCorrectAnswers(exam);
        }
        return ResponseEntity.ok(ApiResponse.success("Exam fetched successfully", exam));
    }

    @PreAuthorize("hasPermission(#examId, 'Exam', 'UPDATE')")
    @PutMapping("admin/exams/{examId}")
    @Operation(summary = "Cập nhật bài thi")
    public ResponseEntity<ApiResponse<ExamDto>> updateExam(@PathVariable("examId") Long examId, @RequestBody ExamDto examDto) {
        ExamDto updatedExam = examService.updateExam(examId, examDto);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", updatedExam));
    }

    @PreAuthorize("hasPermission(#examId, 'Exam', 'DELETE')")
    @DeleteMapping("admin/exams/{examId}")
    @Operation(summary = "Xóa bài thi")
    public ResponseEntity<Void> deleteExam(@PathVariable("examId") Long examId) {
        examService.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }
    private ExamDto stripCorrectAnswers(ExamDto exam) {
        if (exam.getQuestions() == null) {
            return exam;
        }
        exam.getQuestions().forEach(question -> {
            if (question.getAnswers() != null) {
                question.getAnswers().forEach(answer -> answer.setIsCorrect(null));
            }
        });
        return exam;
    }

    private void requireCorrectAnswerAccess(Long examId, Long userExamId, User currentUser) {
        User authenticatedUser = authorizationService.requireAuthenticated(currentUser);
        if (authorizationService.isAdminOrMod(authenticatedUser)) {
            return;
        }
        if (userExamId == null) {
            throw new CustomApiException("Access denied", HttpStatus.FORBIDDEN);
        }

        UserExamResponse userExam = userExamService.getUserExamByIdForUser(userExamId, authenticatedUser.getUserId());
        if (userExam.getUserExamDto() == null
                || !examId.equals(userExam.getUserExamDto().getExamId())
                || !"SUBMITTED".equals(userExam.getUserExamDto().getStatus())) {
            throw new CustomApiException("Access denied", HttpStatus.FORBIDDEN);
        }
    }
}
