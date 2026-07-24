package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.service.AdminExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/export")
public class AdminExportController {
    private final AdminExportService adminExportService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<byte[]> exportUsers() {
        return csv("users.csv", adminExportService.exportUsersCsv());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/exam-results")
    public ResponseEntity<byte[]> exportExamResults() {
        return csv("exam-results.csv", adminExportService.exportExamResultsCsv());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/questions")
    public ResponseEntity<byte[]> exportQuestions() {
        return csv("questions.csv", adminExportService.exportQuestionsCsv());
    }

    private ResponseEntity<byte[]> csv(String filename, byte[] bytes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(bytes);
    }
}
