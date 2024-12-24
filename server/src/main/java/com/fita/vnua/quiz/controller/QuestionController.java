package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.service.Impl.QuestionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionServiceImpl questionService;
    @GetMapping("/by-subject/{subjectId}")
    public ResponseEntity<?> getQuestionsBySubject(@PathVariable Long subjectId) {
        List<QuestionDto> questions = questionService.getQuestionsBySubject(subjectId);
        if (questions.isEmpty()) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No question found").build());
        }
        return ResponseEntity.ok(questions);
    }

    @GetMapping("public/chapter/questions/{chapterId}")
    public ResponseEntity<?> getQuestionByChapterId(@PathVariable("chapterId") Long chapterId) {
        List<QuestionDto> questions = questionService.getQuestionsByChapterId(chapterId);
        if (questions.isEmpty()) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No question found").build());
        }
        return ResponseEntity.ok(questions);
    }

    @GetMapping("chapter/questions")
    public ResponseEntity<?> getAllQuestion() {
        List<QuestionDto> questions = questionService.getAllQuestion();
        if (questions.isEmpty()) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No question found").build());
        }
        return ResponseEntity.ok(questionService.getAllQuestion());
    }

    @GetMapping("admin/questions/{questionId}")
    public ResponseEntity<?> getQuestionById(@PathVariable("questionId") Long questionId) {
        QuestionDto question = questionService.getQuestionById(questionId).orElse(null);
        if (question == null) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No question found").build());
        }
        return ResponseEntity.ok(question);
    }

    @PostMapping("admin/questions")
    public ResponseEntity<?> createQuestion(@RequestBody QuestionDto questionDto) {
        return ResponseEntity.ok(questionService.create(questionDto));
    }

    @PatchMapping("admin/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable("questionId") Long questionId,@RequestBody QuestionDto questionDto) {
        return ResponseEntity.ok(questionService.update(questionId, questionDto));
    }

    @DeleteMapping("admin/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable("questionId") Long questionId) {
        return ResponseEntity.ok(questionService.delete(questionId));
    }
}
