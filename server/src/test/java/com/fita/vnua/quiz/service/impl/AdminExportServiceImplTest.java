package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.model.enums.AuthProvider;
import com.fita.vnua.quiz.model.enums.QuestionDifficulty;
import com.fita.vnua.quiz.model.enums.QuestionType;
import com.fita.vnua.quiz.model.enums.UserRole;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminExportServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserExamRepository userExamRepository;

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private AdminExportServiceImpl adminExportService;

    private User testUser;
    private UserExam testUserExam;
    private Question testQuestion;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        testUser = new User();
        testUser.setUserId(userId);
        testUser.setUsername("export_user");
        testUser.setFullName("Nguyen Van A");
        testUser.setEmail("vana@example.com");
        testUser.setPhone("0123456789");
        testUser.setRole(UserRole.USER);
        testUser.setAuthProvider(AuthProvider.LOCAL);
        testUser.setEmailVerified(true);
        testUser.setDeleted(false);

        Subject subject = new Subject();
        subject.setSubjectId(1L);
        subject.setName("CSDL");

        Exam exam = new Exam();
        exam.setExamId(10L);
        exam.setTitle("De thi giua ky");
        exam.setSubject(subject);

        testUserExam = new UserExam();
        testUserExam.setUserExamId(100L);
        testUserExam.setUser(testUser);
        testUserExam.setExam(exam);
        testUserExam.setScore(90.0f);
        testUserExam.setStatus("SUBMITTED");
        testUserExam.setStartTime(LocalDateTime.of(2026, 9, 1, 8, 0));
        testUserExam.setEndTime(LocalDateTime.of(2026, 9, 1, 8, 45));

        Chapter chapter = new Chapter();
        chapter.setName("Chuong 1");
        chapter.setSubject(subject);

        Answer answer = new Answer();
        answer.setOptionId(1L);
        answer.setContent("Dap an dung");
        answer.setIsCorrect(true);

        testQuestion = new Question();
        testQuestion.setQuestionId(50L);
        testQuestion.setContent("Cau hoi 1");
        testQuestion.setChapter(chapter);
        testQuestion.setDifficulty(QuestionDifficulty.EASY);
        testQuestion.setQuestionType(QuestionType.SINGLE_CHOICE);
        testQuestion.setDeleted(false);
        testQuestion.setAnswers(List.of(answer));
    }

    @Test
    void exportUsersCsvGeneratesValidCsvWithBom() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));

        byte[] bytes = adminExportService.exportUsersCsv();
        String content = new String(bytes, StandardCharsets.UTF_8);

        assertThat(content).startsWith("\uFEFF");
        assertThat(content).contains("userId,username,fullName,email,phone,role,provider,emailVerified,deleted");
        assertThat(content).contains("export_user");
        assertThat(content).contains("vana@example.com");
    }

    @Test
    void exportExamResultsCsvGeneratesValidCsv() {
        when(userExamRepository.findAllWithExamSubjectAndUser()).thenReturn(List.of(testUserExam));

        byte[] bytes = adminExportService.exportExamResultsCsv();
        String content = new String(bytes, StandardCharsets.UTF_8);

        assertThat(content).startsWith("\uFEFF");
        assertThat(content).contains("userExamId,userId,username,examId,examTitle,subject,score,status,startTime,endTime");
        assertThat(content).contains("De thi giua ky");
        assertThat(content).contains("CSDL");
        assertThat(content).contains("90.0");
    }

    @Test
    void exportQuestionsCsvGeneratesValidCsv() {
        when(questionRepository.findAllWithDetails()).thenReturn(List.of(testQuestion));

        byte[] bytes = adminExportService.exportQuestionsCsv();
        String content = new String(bytes, StandardCharsets.UTF_8);

        assertThat(content).startsWith("\uFEFF");
        assertThat(content).contains("questionId,subject,chapter,difficulty,type,deleted,content,correctAnswers");
        assertThat(content).contains("Cau hoi 1");
        assertThat(content).contains("Dap an dung");
        assertThat(content).contains("CSDL");
        assertThat(content).contains("Chuong 1");
    }
}
