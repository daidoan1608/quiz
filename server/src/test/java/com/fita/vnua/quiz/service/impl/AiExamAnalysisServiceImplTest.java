package com.fita.vnua.quiz.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.response.ExamAnalysisResponse;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.model.enums.QuestionDifficulty;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.security.InMemoryRateLimiter;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.ai.AiClient;
import com.fita.vnua.quiz.service.ai.AiClientRouter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiExamAnalysisServiceImplTest {

    @Mock
    private UserExamRepository userExamRepository;

    @Mock
    private UserAnswerRepository userAnswerRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private AiClientRouter aiClientRouter;

    @Mock
    private InMemoryRateLimiter rateLimiter;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private AiClient aiClient;

    private ObjectMapper objectMapper;
    private AiProperties aiProperties;
    private AiExamAnalysisServiceImpl aiExamAnalysisService;
    private User testUser;
    private UserExam testUserExam;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        aiProperties = new AiProperties();

        aiExamAnalysisService = new AiExamAnalysisServiceImpl(
                userExamRepository,
                userAnswerRepository,
                questionRepository,
                authorizationService,
                aiClientRouter,
                aiProperties,
                rateLimiter,
                stringRedisTemplate,
                objectMapper
        );

        testUser = new User();
        testUser.setUserId(UUID.randomUUID());
        testUser.setUsername("sinhvien_test");

        Subject subject = new Subject();
        subject.setName("Cơ sở dữ liệu");

        Exam exam = new Exam();
        exam.setExamId(10L);
        exam.setTitle("Kiểm tra giữa kỳ CSDL");
        exam.setDuration(45);
        exam.setSubject(subject);

        testUserExam = new UserExam();
        testUserExam.setUserExamId(100L);
        testUserExam.setUser(testUser);
        testUserExam.setExam(exam);
        testUserExam.setScore(85.0f);
        testUserExam.setStatus("SUBMITTED");
        testUserExam.setStartTime(LocalDateTime.now().minusMinutes(30));
        testUserExam.setEndTime(LocalDateTime.now());
    }

    @Test
    void analyzeExamResult_WhenExamNotFound_ThrowsNotFound() {
        when(userExamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> aiExamAnalysisService.analyzeExamResult(999L, testUser))
                .isInstanceOf(CustomApiException.class)
                .hasMessageContaining("Không tìm thấy kết quả bài thi")
                .extracting("status")
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void analyzeExamResult_WhenCached_ReturnsCachedResponse() {
        when(userExamRepository.findById(100L)).thenReturn(Optional.of(testUserExam));
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);

        String cachedJson = """
                {
                  "userExamId": 100,
                  "performanceTier": "GIỎI",
                  "summary": "Bạn đã hoàn thành bài thi rất tốt.",
                  "strengths": ["Nắm chắc chương SQL"],
                  "weaknesses": ["Sai câu chuẩn hóa"],
                  "recommendations": ["Ôn thêm dạng chuẩn 3NF"],
                  "cached": true,
                  "provider": "gemini"
                }
                """;
        when(valueOperations.get("ai:exam-analysis:ue:100")).thenReturn(cachedJson);

        ExamAnalysisResponse response = aiExamAnalysisService.analyzeExamResult(100L, testUser);

        assertThat(response).isNotNull();
        assertThat(response.isCached()).isTrue();
        assertThat(response.getPerformanceTier()).isEqualTo("GIỎI");
        assertThat(response.getStrengths()).contains("Nắm chắc chương SQL");

        verify(authorizationService).requireSelfOrAdminMod(eq(testUser.getUserId()), eq(testUser));
        verify(aiClientRouter, never()).getActiveClient();
    }

    @Test
    void analyzeExamResult_WhenNotCached_CallsAiAndCaches() {
        when(userExamRepository.findById(100L)).thenReturn(Optional.of(testUserExam));
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("ai:exam-analysis:ue:100")).thenReturn(null);
        when(rateLimiter.allow(anyString(), anyInt(), any(Duration.class))).thenReturn(true);

        Chapter chapter = new Chapter();
        chapter.setName("Truy vấn SQL");

        Question q1 = new Question();
        q1.setQuestionId(1L);
        q1.setContent("Cú pháp SELECT là gì?");
        q1.setDifficulty(QuestionDifficulty.EASY);
        q1.setChapter(chapter);

        Answer a1 = new Answer();
        a1.setOptionId(11L);
        a1.setIsCorrect(true);
        q1.setAnswers(List.of(a1));

        when(questionRepository.findQuestionsByExamIdIncludingDeleted(10L)).thenReturn(List.of(q1));

        UserAnswer ua1 = new UserAnswer();
        ua1.setQuestion(q1);
        ua1.setAnswer(a1);
        when(userAnswerRepository.findUserAnswersByUserExamId(100L)).thenReturn(List.of(ua1));

        when(aiClientRouter.getActiveClient()).thenReturn(aiClient);
        when(aiClient.getProviderName()).thenReturn("gemini");

        String aiResponseJson = """
                ```json
                {
                  "performanceTier": "GIỎI",
                  "summary": "Bạn đã hoàn thành xuất sắc câu hỏi truy vấn SQL.",
                  "strengths": ["Nắm chắc cú pháp SELECT cơ bản"],
                  "weaknesses": ["Cần rèn luyện thêm câu lệnh lồng nhau"],
                  "recommendations": ["Thực hành bài tập GROUP BY và HAVING"]
                }
                ```
                """;
        when(aiClient.generateExplanation(anyString(), anyString())).thenReturn(aiResponseJson);

        ExamAnalysisResponse response = aiExamAnalysisService.analyzeExamResult(100L, testUser);

        assertThat(response).isNotNull();
        assertThat(response.getUserExamId()).isEqualTo(100L);
        assertThat(response.getPerformanceTier()).isEqualTo("GIỎI");
        assertThat(response.getStrengths()).contains("Nắm chắc cú pháp SELECT cơ bản");
        assertThat(response.isCached()).isFalse();

        verify(valueOperations).set(eq("ai:exam-analysis:ue:100"), anyString(), any(Duration.class));
    }
}
