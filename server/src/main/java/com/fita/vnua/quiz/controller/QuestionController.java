package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.impl.AvatarStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "Question API", description = "API cho các chức năng liên quan đến câu hỏi")
public class QuestionController {
    private final QuestionService questionService;
    private final AvatarStorageService avatarStorageService;

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

    @GetMapping("/admin/questions/total-questions/{subjectId}")
    @Operation(summary = "Lấy tổng số câu hỏi theo subjectId")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTotalQuestions(@PathVariable Long subjectId) {
        Map<String, Object> data = questionService.totalQuestionBySubject(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Total questions fetched successfully", data));
    }

    @GetMapping("admin/questions/subject/{subjectId}")
    @Operation(summary = "Lấy câu hỏi theo Id môn học")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionsBySubject(@PathVariable Long subjectId) {
        List<QuestionDto> questions = questionService.getQuestionsBySubject(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
    }

    @GetMapping("public/questions/chapter/{chapterId}")
    @Operation(summary = "Lấy câu hỏi theo Id chương")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionByChapterId(@PathVariable("chapterId") Long chapterId) {
        List<QuestionDto> questions = questionService.getQuestionsByChapterId(chapterId);
        return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
    }

    @GetMapping("admin/questions")
    @Operation(summary = "Lấy tất cả câu hỏi")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getAllQuestion() {
        List<QuestionDto> questions = questionService.getAllQuestion();
        return ResponseEntity.ok(ApiResponse.success("All questions fetched successfully", questions));
    }

    @GetMapping("admin/questions/search")
    @Operation(summary = "Tìm kiếm câu hỏi theo nội dung")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> searchQuestions(@RequestParam("q") String keyword) {
        List<QuestionDto> questions = questionService.searchQuestions(keyword);
        return ResponseEntity.ok(ApiResponse.success("Questions searched successfully", questions));
    }

    @GetMapping("admin/questions/{questionId}")
    @Operation(summary = "Lấy câu hỏi theo Id")
    public ResponseEntity<ApiResponse<QuestionDto>> getQuestionById(@PathVariable("questionId") Long questionId) {
        QuestionDto question = questionService.getQuestionById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success("Question fetched successfully", question));
    }

    @PostMapping("admin/questions")
    @Operation(summary = "Tạo câu hỏi mới")
    public ResponseEntity<ApiResponse<QuestionDto>> createQuestion(@RequestBody QuestionDto questionDto) {
        QuestionDto createdQuestion = questionService.create(questionDto);
        return ResponseEntity.ok(ApiResponse.success("Question created successfully", createdQuestion));
    }

    @PatchMapping("admin/questions/{questionId}")
    @Operation(summary = "Cập nhật câu hỏi")
    public ResponseEntity<ApiResponse<QuestionDto>> updateQuestion(
            @PathVariable("questionId") Long questionId,
            @RequestBody QuestionDto questionDto
    ) {
        QuestionDto updatedQuestion = questionService.update(questionId, questionDto);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", updatedQuestion));
    }

    @DeleteMapping("admin/questions/{questionId}")
    @Operation(summary = "Xóa câu hỏi")
    public ResponseEntity<Void> deleteQuestion(@PathVariable("questionId") Long questionId) {
        questionService.delete(questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("admin/questions/upload-image")
    @Operation(summary = "Upload ảnh minh họa câu hỏi")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadQuestionImage(@RequestParam("file") MultipartFile file) throws Exception {
        var uploaded = avatarStorageService.saveQuestionImage(file);
        return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", Map.of("imageUrl", uploaded.getUrl())));
    }
}
