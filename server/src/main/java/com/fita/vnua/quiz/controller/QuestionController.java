package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("admin/questions/import")
    @Operation(summary = "Import câu hỏi từ file Excel")
    public ResponseEntity<ApiResponse<String>> importQuestions(@RequestParam("file") MultipartFile file,
                                                               @RequestParam("categoryId") Long categoryId,
                                                               @RequestParam("subjectId") Long subjectId,
                                                               @RequestParam("chapterId") Long chapterId) {
        try {
            questionService.importQuestionsFromExcel(file, categoryId, subjectId, chapterId);
            return ResponseEntity.ok(ApiResponse.success("Import câu hỏi thành công", "File imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi import", List.of(e.getMessage())));
        }
    }

    @GetMapping("/admin/questions/total-questions/{subjectId}")
    @Operation(summary = "Lấy tổng số câu hỏi theo subjectId")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTotalQuestions(@PathVariable Long subjectId) {
        try {
            Map<String, Object> data = questionService.totalQuestionBySubject(subjectId);
            return ResponseEntity.ok(ApiResponse.success("Total questions fetched successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch total questions", List.of(e.getMessage())));
        }
    }

    @GetMapping("admin/questions/subject/{subjectId}")
    @Operation(summary = "Lấy câu hỏi theo Id môn học")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionsBySubject(@PathVariable Long subjectId) {
        try {
            List<QuestionDto> questions = questionService.getQuestionsBySubject(subjectId);
            if (questions.isEmpty()) {
                return ResponseEntity.status(204).body(ApiResponse.error("No question found", List.of("No questions found for the given subject")));
            }
            return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch questions", List.of(e.getMessage())));
        }
    }

    @GetMapping("public/questions/chapter/{chapterId}")
    @Operation(summary = "Lấy câu hỏi theo Id chương")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionByChapterId(@PathVariable("chapterId") Long chapterId) {
        try {
            List<QuestionDto> questions = questionService.getQuestionsByChapterId(chapterId);
            if (questions.isEmpty()) {
                return ResponseEntity.status(204).body(ApiResponse.error("No question found", List.of("No questions found for the given chapter")));
            }
            return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch questions", List.of(e.getMessage())));
        }
    }

    @GetMapping("admin/questions")
    @Operation(summary = "Lấy tất cả câu hỏi")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getAllQuestion() {
        try {
            List<QuestionDto> questions = questionService.getAllQuestion();
            if (questions.isEmpty()) {
                return ResponseEntity.status(204).body(ApiResponse.error("No question found", List.of("No questions available")));
            }
            return ResponseEntity.ok(ApiResponse.success("All questions fetched successfully", questions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch all questions", List.of(e.getMessage())));
        }
    }

    @GetMapping("admin/questions/{questionId}")
    @Operation(summary = "Lấy câu hỏi theo Id")
    public ResponseEntity<ApiResponse<QuestionDto>> getQuestionById(@PathVariable("questionId") Long questionId) {
        try {
            QuestionDto question = questionService.getQuestionById(questionId).orElse(null);
            if (question == null) {
                return ResponseEntity.status(204).body(ApiResponse.error("No question found", List.of("No question found for the given ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("Question fetched successfully", question));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch question", List.of(e.getMessage())));
        }
    }

    @PostMapping("admin/questions")
    @Operation(summary = "Tạo câu hỏi mới")
    public ResponseEntity<ApiResponse<QuestionDto>> createQuestion(@RequestBody QuestionDto questionDto) {
        try {
            QuestionDto createdQuestion = questionService.create(questionDto);
            return ResponseEntity.ok(ApiResponse.success("Question created successfully", createdQuestion));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create question", List.of(e.getMessage())));
        }
    }

    @PatchMapping("admin/questions/{questionId}")
    @Operation(summary = "Cập nhật câu hỏi")
    public ResponseEntity<ApiResponse<QuestionDto>> updateQuestion(@PathVariable("questionId") Long questionId, @RequestBody QuestionDto questionDto) {
        try {
            QuestionDto updatedQuestion = questionService.update(questionId, questionDto);
            return ResponseEntity.ok(ApiResponse.success("Question updated successfully", updatedQuestion));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update question", List.of(e.getMessage())));
        }
    }

    @DeleteMapping("admin/questions/{questionId}")
    @Operation(summary = "Xóa câu hỏi")
    public ResponseEntity<ApiResponse<Object>> deleteQuestion(@PathVariable("questionId") Long questionId) {
        try {
            questionService.delete(questionId);
            return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", "Deleted question with id: " + questionId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete question", List.of(e.getMessage())));
        }
    }
}
