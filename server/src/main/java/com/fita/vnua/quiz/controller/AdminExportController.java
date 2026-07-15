package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/export")
public class AdminExportController {
    private final UserRepository userRepository;
    private final UserExamRepository userExamRepository;
    private final QuestionRepository questionRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<byte[]> exportUsers() {
        String csv = "userId,username,fullName,email,phone,role,provider,emailVerified,deleted\n" +
                userRepository.findAll().stream()
                        .map(this::userRow)
                        .collect(Collectors.joining("\n"));
        return csv("users.csv", csv);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/exam-results")
    public ResponseEntity<byte[]> exportExamResults() {
        String csv = "userExamId,userId,username,examId,examTitle,subject,score,status,startTime,endTime\n" +
                userExamRepository.findAll().stream()
                        .map(this::examResultRow)
                        .collect(Collectors.joining("\n"));
        return csv("exam-results.csv", csv);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/questions")
    public ResponseEntity<byte[]> exportQuestions() {
        String csv = "questionId,subject,chapter,difficulty,type,deleted,content,correctAnswers\n" +
                questionRepository.findAll().stream()
                        .map(this::questionRow)
                        .collect(Collectors.joining("\n"));
        return csv("questions.csv", csv);
    }

    private ResponseEntity<byte[]> csv(String filename, String csv) {
        byte[] bytes = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(bytes);
    }

    private String userRow(User user) {
        return join(
                user.getUserId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getAuthProvider(),
                user.isEmailVerified(),
                user.getDeleted());
    }

    private String examResultRow(UserExam userExam) {
        return join(
                userExam.getUserExamId(),
                userExam.getUser().getUserId(),
                userExam.getUser().getUsername(),
                userExam.getExam().getExamId(),
                userExam.getExam().getTitle(),
                userExam.getExam().getSubject().getName(),
                userExam.getScore(),
                userExam.getStatus(),
                userExam.getStartTime(),
                userExam.getEndTime());
    }

    private String questionRow(Question question) {
        String correctAnswers = question.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .map(answer -> answer.getContent())
                .collect(Collectors.joining(" | "));
        return join(
                question.getQuestionId(),
                question.getChapter().getSubject().getName(),
                question.getChapter().getName(),
                question.getDifficulty(),
                question.getQuestionType(),
                question.getDeleted(),
                question.getContent(),
                correctAnswers);
    }

    private String join(Object... values) {
        return java.util.Arrays.stream(values)
                .map(value -> escape(value == null ? "" : String.valueOf(value)))
                .collect(Collectors.joining(","));
    }

    private String escape(String value) {
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
