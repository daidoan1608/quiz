package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.ImportPreviewResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.AuditLogService;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.impl.AvatarStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "Question API", description = "API cho các chức năng liên quan đến câu hỏi")
public class QuestionController {
    private final QuestionService questionService;
    private final AvatarStorageService avatarStorageService;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#subjectId, 'Subject', 'CREATE')")
    @PostMapping("admin/questions/import/preview")
    @Operation(summary = "Kiem tra file Excel truoc khi import cau hoi")
    public ResponseEntity<ApiResponse<ImportPreviewResponse>> previewImportQuestions(
            @RequestParam("file") MultipartFile file,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("chapterId") Long chapterId
    ) throws Exception {
        ImportPreviewResponse preview = questionService.previewImportQuestions(file, categoryId, subjectId, chapterId);
        return ResponseEntity.ok(ApiResponse.success("Import preview fetched successfully", preview));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#subjectId, 'Subject', 'CREATE')")
    @PostMapping("admin/questions/import")
    @Operation(summary = "Import câu hỏi từ file Excel")
    public ResponseEntity<ApiResponse<String>> importQuestions(
            @RequestParam("file") MultipartFile file,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("chapterId") Long chapterId
    ) throws Exception {
        questionService.importQuestionsFromExcel(file, categoryId, subjectId, chapterId);
        return ResponseEntity.ok(ApiResponse.success("Import câu hỏi thành công", "File imported successfully"));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#subjectId, 'Subject', 'READ')")
    @GetMapping("/admin/questions/total-questions/{subjectId}")
    @Operation(summary = "Lấy tổng số câu hỏi theo subjectId")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTotalQuestions(@PathVariable Long subjectId) {
        Map<String, Object> data = questionService.totalQuestionBySubject(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Total questions fetched successfully", data));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#subjectId, 'Subject', 'READ')")
    @GetMapping("admin/questions/subject/{subjectId}")
    @Operation(summary = "Lấy câu hỏi theo Id môn học")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionsBySubject(@PathVariable Long subjectId) {
        List<QuestionDto> questions = questionService.getQuestionsBySubject(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
    }

    @GetMapping("public/questions/chapter/{chapterId}")
    @Operation(summary = "Lấy câu hỏi theo Id chương")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionByChapterId(
            @PathVariable("chapterId") Long chapterId,
            @RequestParam(defaultValue = "false") boolean includeCorrectAnswers,
            @AuthenticationPrincipal User currentUser
    ) {
        List<QuestionDto> questions = questionService.getQuestionsByChapterId(chapterId);
        if (includeCorrectAnswers) {
            authorizationService.requireAuthenticated(currentUser);
        } else {
            stripCorrectAnswers(questions);
        }
        return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/questions")
    @Operation(summary = "Lấy tất cả câu hỏi")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getAllQuestion() {
        List<QuestionDto> questions = questionService.getAllQuestion();
        return ResponseEntity.ok(ApiResponse.success("All questions fetched successfully", questions));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/questions/deleted")
    @Operation(summary = "Lấy danh sách câu hỏi đã xóa mềm")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getDeletedQuestions() {
        List<QuestionDto> questions = questionService.getDeletedQuestions();
        return ResponseEntity.ok(ApiResponse.success("Deleted questions fetched successfully", questions));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/questions/search")
    @Operation(summary = "Tìm kiếm câu hỏi theo nội dung")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> searchQuestions(@RequestParam("q") String keyword) {
        List<QuestionDto> questions = questionService.searchQuestions(keyword);
        return ResponseEntity.ok(ApiResponse.success("Questions searched successfully", questions));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/questions/filter")
    @Operation(summary = "Lọc câu hỏi nâng cao")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> filterQuestions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Boolean deleted,
            @RequestParam(required = false) UUID creatorId
    ) {
        List<QuestionDto> questions = questionService.filterQuestions(keyword, subjectId, chapterId, difficulty, deleted, creatorId);
        return ResponseEntity.ok(ApiResponse.success("Questions filtered successfully", questions));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#questionId, 'Question', 'READ')")
    @GetMapping("admin/questions/{questionId}")
    @Operation(summary = "Lấy câu hỏi theo Id")
    public ResponseEntity<ApiResponse<QuestionDto>> getQuestionById(@PathVariable("questionId") Long questionId) {
        QuestionDto question = questionService.getQuestionById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success("Question fetched successfully", question));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#questionDto.chapterId, 'Chapter', 'CREATE')")
    @PostMapping("admin/questions")
    @Operation(summary = "Tạo câu hỏi mới")
    public ResponseEntity<ApiResponse<QuestionDto>> createQuestion(@RequestBody QuestionDto questionDto, @AuthenticationPrincipal User currentUser) {
        QuestionDto createdQuestion = questionService.create(questionDto);
        auditLogService.record("CREATE", "QUESTION", createdQuestion.getQuestionId(), currentUser, createdQuestion.getContent());
        return ResponseEntity.ok(ApiResponse.success("Question created successfully", createdQuestion));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#questionId, 'Question', 'UPDATE')")
    @PatchMapping("admin/questions/{questionId}")
    @Operation(summary = "Cập nhật câu hỏi")
    public ResponseEntity<ApiResponse<QuestionDto>> updateQuestion(
            @PathVariable("questionId") Long questionId,
            @RequestBody QuestionDto questionDto,
            @AuthenticationPrincipal User currentUser
    ) {
        QuestionDto updatedQuestion = questionService.update(questionId, questionDto);
        auditLogService.record("UPDATE", "QUESTION", questionId, currentUser, updatedQuestion.getContent());
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", updatedQuestion));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#questionId, 'Question', 'DELETE')")
    @DeleteMapping("admin/questions/{questionId}")
    @Operation(summary = "Xóa mềm câu hỏi")
    public ResponseEntity<Void> deleteQuestion(@PathVariable("questionId") Long questionId, @AuthenticationPrincipal User currentUser) {
        questionService.delete(questionId);
        auditLogService.record("DELETE", "QUESTION", questionId, currentUser, "Soft delete question");
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#questionId, 'Question', 'UPDATE')")
    @PatchMapping("admin/questions/{questionId}/restore")
    @Operation(summary = "Khôi phục câu hỏi đã xóa mềm")
    public ResponseEntity<ApiResponse<QuestionDto>> restoreQuestion(@PathVariable("questionId") Long questionId) {
        QuestionDto restoredQuestion = questionService.restore(questionId);
        return ResponseEntity.ok(ApiResponse.success("Question restored successfully", restoredQuestion));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("admin/questions/upload-image")
    @Operation(summary = "Upload ảnh minh họa câu hỏi")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadQuestionImage(@RequestParam("file") MultipartFile file) throws Exception {
        var uploaded = avatarStorageService.saveQuestionImage(file);
        return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", Map.of("imageUrl", uploaded.getUrl())));
    }
    private List<QuestionDto> stripCorrectAnswers(List<QuestionDto> questions) {
        if (questions == null) {
            return List.of();
        }
        questions.forEach(this::stripCorrectAnswers);
        return questions;
    }

    private void stripCorrectAnswers(QuestionDto question) {
        if (question.getAnswers() == null) {
            return;
        }
        question.getAnswers().forEach(answer -> answer.setIsCorrect(null));
    }
}
