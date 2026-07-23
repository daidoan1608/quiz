package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.AdminExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminExportServiceImpl implements AdminExportService {

    private final UserRepository userRepository;
    private final UserExamRepository userExamRepository;
    private final QuestionRepository questionRepository;

    @Override
    public byte[] exportUsersCsv() {
        String csv = "userId,username,fullName,email,phone,role,provider,emailVerified,deleted\n" +
                userRepository.findAll().stream()
                        .map(this::userRow)
                        .collect(Collectors.joining("\n"));
        return csvBytes(csv);
    }

    @Override
    public byte[] exportExamResultsCsv() {
        String csv = "userExamId,userId,username,examId,examTitle,subject,score,status,startTime,endTime\n" +
                userExamRepository.findAllWithExamSubjectAndUser().stream()
                        .map(this::examResultRow)
                        .collect(Collectors.joining("\n"));
        return csvBytes(csv);
    }

    @Override
    public byte[] exportQuestionsCsv() {
        String csv = "questionId,subject,chapter,difficulty,type,deleted,content,correctAnswers\n" +
                questionRepository.findAllWithDetails().stream()
                        .map(this::questionRow)
                        .collect(Collectors.joining("\n"));
        return csvBytes(csv);
    }

    private byte[] csvBytes(String csv) {
        return ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
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
        return Arrays.stream(values)
                .map(value -> escape(value == null ? "" : String.valueOf(value)))
                .collect(Collectors.joining(","));
    }

    private String escape(String value) {
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
