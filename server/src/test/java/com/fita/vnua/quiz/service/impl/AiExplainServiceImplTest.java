package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.request.ExplainQuestionRequest;
import com.fita.vnua.quiz.model.dto.response.ExplainQuestionResponse;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.QuestionRepository;
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
import org.springframework.http.HttpStatus;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiExplainServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

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

    private AiProperties aiProperties;
    private AiExplainServiceImpl aiExplainService;
    private User testUser;
    private Question testQuestion;

    @BeforeEach
    void setUp() {
        aiProperties = new AiProperties();
        aiProperties.setRateLimitMaxAttempts(10);
        aiProperties.setRateLimitWindow(Duration.ofMinutes(5));
        aiProperties.setCacheTtl(Duration.ofDays(7));

        aiExplainService = new AiExplainServiceImpl(
                questionRepository,
                aiClientRouter,
                aiProperties,
                rateLimiter,
                stringRedisTemplate
        );

        testUser = new User();
        testUser.setUserId(UUID.randomUUID());
        testUser.setUsername("sinhvien1");

        Subject subject = new Subject();
        subject.setName("Cấu trúc dữ liệu");

        Chapter chapter = new Chapter();
        chapter.setName("Cây nhị phân");
        chapter.setSubject(subject);

        testQuestion = new Question();
        testQuestion.setQuestionId(101L);
        testQuestion.setContent("Độ phức tạp tìm kiếm trong BST trung bình là gì?");
        testQuestion.setChapter(chapter);

        Answer answerA = new Answer();
        answerA.setOptionId(1L);
        answerA.setContent("O(log n)");
        answerA.setIsCorrect(true);

        Answer answerB = new Answer();
        answerB.setOptionId(2L);
        answerB.setContent("O(n^2)");
        answerB.setIsCorrect(false);

        testQuestion.setAnswers(List.of(answerA, answerB));
    }

    @Test
    void explainQuestion_WhenQuestionNotFound_ThrowsNotFound() {
        ExplainQuestionRequest request = new ExplainQuestionRequest(999L, List.of(1L));
        when(questionRepository.findByQuestionIdAndDeletedFalse(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> aiExplainService.explainQuestion(request, testUser))
                .isInstanceOf(CustomApiException.class)
                .hasMessageContaining("Không tìm thấy câu hỏi")
                .extracting("status")
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void explainQuestion_WhenRateLimitExceeded_ThrowsTooManyRequests() {
        ExplainQuestionRequest request = new ExplainQuestionRequest(101L, List.of(2L));
        when(questionRepository.findByQuestionIdAndDeletedFalse(101L)).thenReturn(Optional.of(testQuestion));
        when(rateLimiter.allow(anyString(), anyInt(), any(Duration.class))).thenReturn(false);

        assertThatThrownBy(() -> aiExplainService.explainQuestion(request, testUser))
                .isInstanceOf(CustomApiException.class)
                .hasMessageContaining("hết lượt hỏi AI")
                .extracting("status")
                .isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    @Test
    void explainQuestion_WhenCachedInRedis_ReturnsCachedExplanation() {
        ExplainQuestionRequest request = new ExplainQuestionRequest(101L, List.of(2L));
        when(questionRepository.findByQuestionIdAndDeletedFalse(101L)).thenReturn(Optional.of(testQuestion));
        when(rateLimiter.allow(anyString(), anyInt(), any(Duration.class))).thenReturn(true);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("ai:explain:q:101:sel:2")).thenReturn("Giải thích đã được lưu cache trước đó");

        ExplainQuestionResponse response = aiExplainService.explainQuestion(request, testUser);

        assertThat(response).isNotNull();
        assertThat(response.getQuestionId()).isEqualTo(101L);
        assertThat(response.getExplanation()).isEqualTo("Giải thích đã được lưu cache trước đó");
        assertThat(response.isCached()).isTrue();
        assertThat(response.getProvider()).isEqualTo("cache");

        verify(aiClientRouter, never()).getActiveClient();
    }

    @Test
    void explainQuestion_WhenNotCached_CallsAiClientAndCachesResult() {
        ExplainQuestionRequest request = new ExplainQuestionRequest(101L, List.of(2L));
        when(questionRepository.findByQuestionIdAndDeletedFalse(101L)).thenReturn(Optional.of(testQuestion));
        when(rateLimiter.allow(anyString(), anyInt(), any(Duration.class))).thenReturn(true);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);

        when(aiClientRouter.getActiveClient()).thenReturn(aiClient);
        when(aiClient.getProviderName()).thenReturn("gemini");
        when(aiClient.generateExplanation(anyString(), anyString())).thenReturn("### 1. Phân tích đáp án đúng\nO(log n) là chính xác...");

        ExplainQuestionResponse response = aiExplainService.explainQuestion(request, testUser);

        assertThat(response).isNotNull();
        assertThat(response.getQuestionId()).isEqualTo(101L);
        assertThat(response.getExplanation()).contains("O(log n) là chính xác");
        assertThat(response.isCached()).isFalse();
        assertThat(response.getProvider()).isEqualTo("gemini");

        verify(valueOperations).set(eq("ai:explain:q:101:sel:2"), eq(response.getExplanation()), any(Duration.class));
    }
}
