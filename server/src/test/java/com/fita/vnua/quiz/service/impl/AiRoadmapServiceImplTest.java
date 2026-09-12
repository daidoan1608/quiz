package com.fita.vnua.quiz.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.model.dto.response.LearningRoadmapResponse;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.security.InMemoryRateLimiter;
import com.fita.vnua.quiz.service.ai.AiClient;
import com.fita.vnua.quiz.service.ai.AiClientRouter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiRoadmapServiceImplTest {

    @Mock
    private UserExamRepository userExamRepository;

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
    private AiRoadmapServiceImpl aiRoadmapService;
    private User testUser;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        aiProperties = new AiProperties();

        aiRoadmapService = new AiRoadmapServiceImpl(
                userExamRepository,
                aiClientRouter,
                aiProperties,
                rateLimiter,
                stringRedisTemplate,
                objectMapper
        );

        testUser = new User();
        testUser.setUserId(UUID.randomUUID());
        testUser.setUsername("sinhvien_test");
    }

    @Test
    void getPersonalizedRoadmap_WhenNoSubmittedExams_ReturnsOnboardingRoadmap() {
        when(userExamRepository.findUserExamsByUserId(testUser.getUserId()))
                .thenReturn(Collections.emptyList());

        LearningRoadmapResponse response = aiRoadmapService.getPersonalizedRoadmap(testUser, false);

        assertThat(response).isNotNull();
        assertThat(response.getProvider()).isEqualTo("system");
        assertThat(response.getSteps()).hasSize(4);
        assertThat(response.getSummary()).contains("Chào mừng bạn");

        verify(aiClientRouter, never()).getActiveClient();
    }

    @Test
    void getPersonalizedRoadmap_WhenCached_ReturnsCachedResponse() {
        Subject subject = new Subject();
        subject.setName("Toán cao cấp");

        Exam exam = new Exam();
        exam.setSubject(subject);

        UserExam userExam = new UserExam();
        userExam.setStatus("SUBMITTED");
        userExam.setScore(80.0f);
        userExam.setStartTime(LocalDateTime.now().minusHours(1));
        userExam.setEndTime(LocalDateTime.now());
        userExam.setExam(exam);

        when(userExamRepository.findUserExamsByUserId(testUser.getUserId()))
                .thenReturn(List.of(userExam));
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);

        String cachedJson = """
                {
                  "summary": "Bạn đang học rất tốt môn Toán cao cấp!",
                  "steps": [
                    { "step": 1, "title": "Duy trì môn Toán", "action": "Luyện thêm 1 đề", "priority": "MEDIUM", "subjectName": "Toán cao cấp" }
                  ],
                  "cached": true,
                  "provider": "gemini"
                }
                """;
        when(valueOperations.get(anyString())).thenReturn(cachedJson);

        LearningRoadmapResponse response = aiRoadmapService.getPersonalizedRoadmap(testUser, false);

        assertThat(response).isNotNull();
        assertThat(response.isCached()).isTrue();
        assertThat(response.getSummary()).contains("Bạn đang học rất tốt");
        assertThat(response.getSteps()).hasSize(1);

        verify(aiClientRouter, never()).getActiveClient();
    }

    @Test
    void getPersonalizedRoadmap_WhenNotCached_CallsAiAndCaches() {
        Subject subject = new Subject();
        subject.setName("Tin học đại cương");

        Exam exam = new Exam();
        exam.setSubject(subject);

        UserExam userExam = new UserExam();
        userExam.setStatus("SUBMITTED");
        userExam.setScore(55.0f);
        userExam.setStartTime(LocalDateTime.now().minusDays(1));
        userExam.setEndTime(LocalDateTime.now().minusDays(1).plusMinutes(45));
        userExam.setExam(exam);

        when(userExamRepository.findUserExamsByUserId(testUser.getUserId()))
                .thenReturn(List.of(userExam));
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(rateLimiter.allow(anyString(), anyInt(), any(Duration.class))).thenReturn(true);

        when(aiClientRouter.getActiveClient()).thenReturn(aiClient);
        when(aiClient.getProviderName()).thenReturn("gemini");

        String aiResponseJson = """
                ```json
                {
                  "summary": "Môn Tin học đại cương của bạn cần được cải thiện sớm.",
                  "steps": [
                    {
                      "step": 1,
                      "title": "Cấp bách: Ôn lại môn Tin học đại cương",
                      "action": "Điểm số 55 đang dưới 70, hãy làm lại 2 bài thi trắc nghiệm chương Hàm và Mảng.",
                      "priority": "HIGH",
                      "subjectName": "Tin học đại cương"
                    }
                  ]
                }
                ```
                """;
        when(aiClient.generateExplanation(anyString(), anyString())).thenReturn(aiResponseJson);

        LearningRoadmapResponse response = aiRoadmapService.getPersonalizedRoadmap(testUser, false);

        assertThat(response).isNotNull();
        assertThat(response.isCached()).isFalse();
        assertThat(response.getSummary()).contains("Môn Tin học đại cương");
        assertThat(response.getSteps()).hasSize(1);
        assertThat(response.getSteps().get(0).getPriority()).isEqualTo("HIGH");

        verify(valueOperations).set(anyString(), anyString(), any(Duration.class));
    }
}
