package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
public class QuestionController {
    private final QuestionService questionServiceImpl;

    // Import câu hỏi từ file Excel (admin)
    @PostMapping("admin/questions/import")
    public ResponseEntity<ApiResponse<String>> importQuestions(@RequestParam("file") MultipartFile file,
                                                               @RequestParam("categoryId") Long categoryId,
                                                               @RequestParam("subjectId") Long subjectId,
                                                               @RequestParam("chapterId") Long chapterId) {
        try {
            questionServiceImpl.importQuestionsFromExcel(file, categoryId, subjectId, chapterId);
            return ResponseEntity.ok(ApiResponse.success("Import câu hỏi thành công", "File imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi import", List.of(e.getMessage())));
        }
    }

    // Lấy tổng số câu hỏi theo subjectId (admin)
    @GetMapping("/admin/questions/total-questions/{subjectId}")
    public ResponseEntity<ApiResponse<Integer>> getTotalQuestions(@PathVariable Long subjectId) {
        try {
            Integer totalQuestions = questionServiceImpl.totalQuestionBySubject(subjectId).size();
            return ResponseEntity.ok(ApiResponse.success("Total questions fetched successfully", totalQuestions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch total questions", List.of(e.getMessage())));
        }
    }

    // Lấy câu hỏi theo subjectId (public)
    @GetMapping("admin/questions/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionsBySubject(@PathVariable Long subjectId) {
        try {
            List<QuestionDto> questions = questionServiceImpl.getQuestionsBySubject(subjectId);
            if (questions.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No question found", List.of("No questions found for the given subject")));
            }
            return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch questions", List.of(e.getMessage())));
        }
    }

    // Lấy câu hỏi theo chapterId (public)
    @GetMapping("public/questions/chapter/{chapterId}")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getQuestionByChapterId(@PathVariable("chapterId") Long chapterId) {
        try {
            List<QuestionDto> questions = questionServiceImpl.getQuestionsByChapterId(chapterId);
            if (questions.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No question found", List.of("No questions found for the given chapter")));
            }
            return ResponseEntity.ok(ApiResponse.success("Questions fetched successfully", questions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch questions", List.of(e.getMessage())));
        }
    }

    // Lấy tất cả câu hỏi (public)
    @GetMapping("admin/questions")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> getAllQuestion() {
        try {
            List<QuestionDto> questions = questionServiceImpl.getAllQuestion();
            if (questions.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No question found", List.of("No questions available")));
            }
            return ResponseEntity.ok(ApiResponse.success("All questions fetched successfully", questions));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch all questions", List.of(e.getMessage())));
        }
    }

    // Lấy câu hỏi theo questionId (admin)
    @GetMapping("admin/questions/{questionId}")
    public ResponseEntity<ApiResponse<QuestionDto>> getQuestionById(@PathVariable("questionId") Long questionId) {
        try {
            QuestionDto question = questionServiceImpl.getQuestionById(questionId).orElse(null);
            if (question == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("No question found", List.of("No question found for the given ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("Question fetched successfully", question));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch question", List.of(e.getMessage())));
        }
    }

    // Tạo câu hỏi mới (admin)
    @PostMapping("admin/questions")
    public ResponseEntity<ApiResponse<QuestionDto>> createQuestion(@RequestBody QuestionDto questionDto) {
        try {
            QuestionDto createdQuestion = questionServiceImpl.create(questionDto);
            return ResponseEntity.ok(ApiResponse.success("Question created successfully", createdQuestion));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create question", List.of(e.getMessage())));
        }
    }

    // Cập nhật câu hỏi (admin)
    @PatchMapping("admin/questions/{questionId}")
    public ResponseEntity<ApiResponse<QuestionDto>> updateQuestion(@PathVariable("questionId") Long questionId, @RequestBody QuestionDto questionDto) {
        try {
            QuestionDto updatedQuestion = questionServiceImpl.update(questionId, questionDto);
            return ResponseEntity.ok(ApiResponse.success("Question updated successfully", updatedQuestion));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update question", List.of(e.getMessage())));
        }
    }

    // Xóa câu hỏi (admin)
    @DeleteMapping("admin/questions/{questionId}")
    public ResponseEntity<ApiResponse<Object>> deleteQuestion(@PathVariable("questionId") Long questionId) {
        try {
            questionServiceImpl.delete(questionId);
            return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", "Deleted question with id: " + questionId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete question", List.of(e.getMessage())));
        }
    }
}
