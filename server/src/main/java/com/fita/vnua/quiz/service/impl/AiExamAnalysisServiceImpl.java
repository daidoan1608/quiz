package com.fita.vnua.quiz.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
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
import com.fita.vnua.quiz.service.AiExamAnalysisService;
import com.fita.vnua.quiz.service.AuthorizationService;
import com.fita.vnua.quiz.service.ai.AiClient;
import com.fita.vnua.quiz.service.ai.AiClientRouter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiExamAnalysisServiceImpl implements AiExamAnalysisService {

    private final UserExamRepository userExamRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final QuestionRepository questionRepository;
    private final AuthorizationService authorizationService;
    private final AiClientRouter aiClientRouter;
    private final AiProperties aiProperties;
    private final InMemoryRateLimiter rateLimiter;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration EXAM_ANALYSIS_CACHE_TTL = Duration.ofDays(30);

    @Override
    @Transactional(readOnly = true)
    public ExamAnalysisResponse analyzeExamResult(Long userExamId, User currentUser) {
        if (currentUser == null || currentUser.getUserId() == null) {
            throw new CustomApiException("UNAUTHORIZED", "Vui lòng đăng nhập để phân tích kết quả bài thi", HttpStatus.UNAUTHORIZED);
        }

        // 1. Kiểm tra bài thi tồn tại và quyền truy cập
        UserExam userExam = userExamRepository.findById(userExamId)
                .orElseThrow(() -> new CustomApiException("NOT_FOUND", "Không tìm thấy kết quả bài thi với ID: " + userExamId, HttpStatus.NOT_FOUND));

        authorizationService.requireSelfOrAdminMod(userExam.getUser().getUserId(), currentUser);

        // 2. Kiểm tra Redis cache (kết quả bài thi đã nộp là bất biến nên cache dùng lại vĩnh viễn/30 ngày)
        String cacheKey = "ai:exam-analysis:ue:" + userExamId;
        try {
            String cachedJson = stringRedisTemplate.opsForValue().get(cacheKey);
            if (StringUtils.hasText(cachedJson)) {
                ExamAnalysisResponse cached = objectMapper.readValue(cachedJson, ExamAnalysisResponse.class);
                cached.setCached(true);
                return cached;
            }
        } catch (Exception e) {
            log.warn("Redis get exam analysis cache error: {}", e.getMessage());
        }

        // 3. Rate Limit
        String rateLimitKey = "ai-exam-analysis:" + currentUser.getUserId();
        if (!rateLimiter.allow(rateLimitKey, 15, Duration.ofMinutes(10))) {
            throw new CustomApiException("RATE_LIMIT_EXCEEDED",
                    "Bạn đã yêu cầu phân tích bài thi quá nhiều lần. Vui lòng thử lại sau ít phút!",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        // 4. Thu thập số liệu chi tiết của bài thi
        Exam exam = userExam.getExam();
        String subjectName = exam != null && exam.getSubject() != null ? exam.getSubject().getName() : "Không xác định";
        String examTitle = exam != null ? exam.getTitle() : "Bài kiểm tra";
        float score = userExam.getScore() != null ? userExam.getScore() : 0.0f;

        long durationMinutes = 0;
        if (userExam.getStartTime() != null && userExam.getEndTime() != null) {
            durationMinutes = Duration.between(userExam.getStartTime(), userExam.getEndTime()).toMinutes();
        }
        int maxDurationMinutes = exam != null && exam.getDuration() != null ? exam.getDuration() : 60;

        List<Question> questions = exam != null
                ? questionRepository.findQuestionsByExamId(exam.getExamId())
                : Collections.emptyList();

        List<UserAnswer> userAnswers = userAnswerRepository.findUserAnswersByUserExamId(userExamId);

        // Map: questionId -> Set of chosen answerIds
        Map<Long, Set<Long>> chosenMap = userAnswers.stream()
                .filter(ua -> ua.getQuestion() != null && ua.getAnswer() != null)
                .collect(Collectors.groupingBy(
                        ua -> ua.getQuestion().getQuestionId(),
                        Collectors.mapping(ua -> ua.getAnswer().getOptionId(), Collectors.toSet())
                ));

        // Phân tích theo Chương (Chapter)
        Map<String, int[]> chapterStats = new LinkedHashMap<>(); // chapterName -> [correct, total]
        // Phân tích theo Độ khó (Difficulty)
        Map<String, int[]> difficultyStats = new LinkedHashMap<>(); // difficultyName -> [correct, total]

        int correctCount = 0;
        int wrongCount = 0;
        int skippedCount = 0;

        for (Question q : questions) {
            String chapterName = q.getChapter() != null ? q.getChapter().getName() : "Chương chung";
            String diffName = q.getDifficulty() != null ? q.getDifficulty().name() : "MEDIUM";

            chapterStats.putIfAbsent(chapterName, new int[2]);
            difficultyStats.putIfAbsent(diffName, new int[2]);

            chapterStats.get(chapterName)[1]++;
            difficultyStats.get(diffName)[1]++;

            Set<Long> chosen = chosenMap.get(q.getQuestionId());
            if (chosen == null || chosen.isEmpty()) {
                skippedCount++;
            } else {
                Set<Long> correctIds = q.getAnswers().stream()
                        .filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                        .map(Answer::getOptionId)
                        .collect(Collectors.toSet());

                if (chosen.equals(correctIds)) {
                    correctCount++;
                    chapterStats.get(chapterName)[0]++;
                    difficultyStats.get(diffName)[0]++;
                } else {
                    wrongCount++;
                }
            }
        }

        // 5. Xây dựng Prompt
        StringBuilder chapterSummary = new StringBuilder();
        for (Map.Entry<String, int[]> entry : chapterStats.entrySet()) {
            int c = entry.getValue()[0];
            int t = entry.getValue()[1];
            double pct = t > 0 ? ((double) c / t) * 100 : 0;
            chapterSummary.append(String.format("- %s: %d/%d câu đúng (%.0f%%)\n", entry.getKey(), c, t, pct));
        }

        StringBuilder diffSummary = new StringBuilder();
        for (Map.Entry<String, int[]> entry : difficultyStats.entrySet()) {
            int c = entry.getValue()[0];
            int t = entry.getValue()[1];
            diffSummary.append(String.format("- Mức độ %s: %d/%d câu đúng\n", entry.getKey(), c, t));
        }

        String systemPrompt = """
                Bạn là một Chuyên gia Đánh giá Khảo thí & Cố vấn học tập (Senior Exam Evaluator) của Đại học Nông nghiệp (VNUA).
                Nhiệm vụ của bạn là phân tích sâu kết quả bài thi trắc nghiệm của sinh viên một cách sư phạm, khách quan, chỉ ra điểm mạnh, điểm yếu và lời khuyên bứt phá điểm số.
                BẮT BUỘC chỉ trả về kết quả dưới dạng chuỗi JSON thuần túy (không bọc trong markdown code fence, không kèm lời chào hỏi đầu hay cuối).
                """;

        String userPrompt = String.format("""
                Thông tin bài thi:
                - Môn học: %s
                - Đề thi: %s
                - Điểm số: %.1f / 100
                - Thời gian làm bài: %d phút / %d phút quy định
                - Tổng số câu hỏi: %d (Đúng: %d, Sai: %d, Bỏ qua: %d)
                
                Kết quả theo từng Chương:
                %s
                
                Kết quả theo Độ khó:
                %s
                
                Hãy phân tích và trả về JSON theo đúng định dạng sau:
                {
                  "performanceTier": "XUẤT SẮC" | "GIỎI" | "KHÁ" | "TRUNG BÌNH" | "CẦN CỐ GẮNG",
                  "summary": "Nhận xét tổng quan về bài thi (2-3 câu nêu bật phong độ và tinh thần làm bài)",
                  "strengths": [
                    "Điểm mạnh 1 (các chương hoặc dạng câu hỏi đạt điểm cao/tốc độ tốt)",
                    "Điểm mạnh 2..."
                  ],
                  "weaknesses": [
                    "Điểm cần khắc phục 1 (các chương sai nhiều hoặc bẫy câu hỏi)",
                    "Điểm cần khắc phục 2..."
                  ],
                  "recommendations": [
                    "Chiến lược và lời khuyên thiết thực 1 cho lần thi tiếp theo",
                    "Chiến lược 2..."
                  ]
                }
                """, subjectName, examTitle, score, durationMinutes, maxDurationMinutes,
                questions.size(), correctCount, wrongCount, skippedCount,
                chapterSummary.toString(), diffSummary.toString());

        // 6. Gọi AI
        AiClient client = aiClientRouter.getActiveClient();
        String rawResponse = client.generateExplanation(systemPrompt, userPrompt);

        // 7. Parse kết quả và lưu Cache
        ExamAnalysisResponse result = parseExamAnalysisResponse(userExamId, rawResponse, client.getProviderName(), score);

        try {
            String jsonToCache = objectMapper.writeValueAsString(result);
            stringRedisTemplate.opsForValue().set(cacheKey, jsonToCache, EXAM_ANALYSIS_CACHE_TTL);
        } catch (Exception e) {
            log.warn("Redis set exam analysis cache error: {}", e.getMessage());
        }

        return result;
    }

    private ExamAnalysisResponse parseExamAnalysisResponse(Long userExamId, String rawResponse, String provider, float score) {
        String cleanJson = rawResponse.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }
        cleanJson = cleanJson.trim();

        try {
            JsonNode root = objectMapper.readTree(cleanJson);
            String performanceTier = root.path("performanceTier").asText(resolveDefaultTier(score));
            String summary = root.path("summary").asText("Bài thi đã được ghi nhận và đánh giá chi tiết bởi AI.");

            List<String> strengths = extractStringList(root.path("strengths"));
            List<String> weaknesses = extractStringList(root.path("weaknesses"));
            List<String> recommendations = extractStringList(root.path("recommendations"));

            return ExamAnalysisResponse.builder()
                    .userExamId(userExamId)
                    .performanceTier(performanceTier)
                    .summary(summary)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .recommendations(recommendations)
                    .cached(false)
                    .provider(provider)
                    .build();
        } catch (Exception e) {
            log.error("Error parsing AI exam analysis JSON: {}, raw response: {}", e.getMessage(), rawResponse);
            return ExamAnalysisResponse.builder()
                    .userExamId(userExamId)
                    .performanceTier(resolveDefaultTier(score))
                    .summary(cleanJson.length() > 200 ? cleanJson.substring(0, 200) + "..." : cleanJson)
                    .strengths(List.of("Đã nỗ lực hoàn thành bài thi trắc nghiệm."))
                    .weaknesses(List.of("Cần xem lại các câu làm sai trong danh sách chi tiết bên dưới."))
                    .recommendations(List.of("Ôn lại lý thuyết và luyện thêm các bài thi tương tự."))
                    .cached(false)
                    .provider(provider)
                    .build();
        }
    }

    private String resolveDefaultTier(float score) {
        if (score >= 90) return "XUẤT SẮC";
        if (score >= 80) return "GIỎI";
        if (score >= 65) return "KHÁ";
        if (score >= 50) return "TRUNG BÌNH";
        return "CẦN CỐ GẮNG";
    }

    private List<String> extractStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual() && StringUtils.hasText(item.asText())) {
                    list.add(item.asText());
                }
            }
        }
        return list.isEmpty() ? List.of("Đang cập nhật đánh giá chi tiết.") : list;
    }
}
