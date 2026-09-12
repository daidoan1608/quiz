package com.fita.vnua.quiz.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ai.RoadmapStepDto;
import com.fita.vnua.quiz.model.dto.response.LearningRoadmapResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.security.InMemoryRateLimiter;
import com.fita.vnua.quiz.service.AiRoadmapService;
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
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRoadmapServiceImpl implements AiRoadmapService {

    private final UserExamRepository userExamRepository;
    private final AiClientRouter aiClientRouter;
    private final AiProperties aiProperties;
    private final InMemoryRateLimiter rateLimiter;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration ROADMAP_CACHE_TTL = Duration.ofHours(24);

    @Override
    @Transactional(readOnly = true)
    public LearningRoadmapResponse getPersonalizedRoadmap(User currentUser, boolean forceRefresh) {
        if (currentUser == null || currentUser.getUserId() == null) {
            throw new CustomApiException("UNAUTHORIZED", "Vui lòng đăng nhập để xem lộ trình học tập", HttpStatus.UNAUTHORIZED);
        }

        // 1. Lấy danh sách các bài thi đã nộp của sinh viên
        List<UserExam> allExams = userExamRepository.findUserExamsByUserId(currentUser.getUserId());
        List<UserExam> submittedExams = allExams != null ? allExams.stream()
                .filter(e -> "SUBMITTED".equalsIgnoreCase(e.getStatus()) && e.getScore() != null)
                .toList() : Collections.emptyList();

        // 2. Nếu sinh viên chưa có bài thi nào, trả về lộ trình khởi động
        if (submittedExams.isEmpty()) {
            return buildOnboardingRoadmap();
        }

        // 3. Kiểm tra Redis cache
        long latestTimestamp = submittedExams.stream()
                .map(e -> e.getEndTime() != null ? e.getEndTime() : e.getStartTime())
                .filter(Objects::nonNull)
                .mapToLong(t -> t.atZone(ZoneId.systemDefault()).toEpochSecond())
                .max()
                .orElse(0L);

        String cacheKey = String.format("ai:roadmap:u:%s:c:%d:t:%d",
                currentUser.getUserId(), submittedExams.size(), latestTimestamp);

        if (!forceRefresh) {
            try {
                String cachedJson = stringRedisTemplate.opsForValue().get(cacheKey);
                if (StringUtils.hasText(cachedJson)) {
                    LearningRoadmapResponse cached = objectMapper.readValue(cachedJson, LearningRoadmapResponse.class);
                    cached.setCached(true);
                    return cached;
                }
            } catch (Exception e) {
                log.warn("Redis get roadmap cache error: {}", e.getMessage());
            }
        }

        // 4. Rate Limiting cho sinh lộ trình
        String rateLimitKey = "ai-roadmap:" + currentUser.getUserId();
        if (!rateLimiter.allow(rateLimitKey, 10, Duration.ofMinutes(10))) {
            throw new CustomApiException("RATE_LIMIT_EXCEEDED",
                    "Bạn đã yêu cầu tạo lộ trình quá nhiều lần trong thời gian ngắn. Vui lòng đợi 10 phút rồi thử lại!",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        // 5. Tính toán dữ liệu thống kê
        Map<String, List<UserExam>> bySubject = submittedExams.stream()
                .filter(e -> e.getExam() != null && e.getExam().getSubject() != null)
                .collect(Collectors.groupingBy(e -> e.getExam().getSubject().getName()));

        StringBuilder statsSummary = new StringBuilder();
        double totalScoreSum = 0;
        int totalValidExams = 0;

        for (Map.Entry<String, List<UserExam>> entry : bySubject.entrySet()) {
            String subjectName = entry.getKey();
            List<UserExam> subjectExams = entry.getValue();
            double avgScore = subjectExams.stream().mapToDouble(e -> e.getScore() != null ? e.getScore() : 0).average().orElse(0);
            double maxScore = subjectExams.stream().mapToDouble(e -> e.getScore() != null ? e.getScore() : 0).max().orElse(0);
            double minScore = subjectExams.stream().mapToDouble(e -> e.getScore() != null ? e.getScore() : 0).min().orElse(0);

            statsSummary.append(String.format("- Môn '%s': %d bài thi, Điểm TB: %.1f/100, Cao nhất: %.1f, Thấp nhất: %.1f\n",
                    subjectName, subjectExams.size(), avgScore, maxScore, minScore));

            totalScoreSum += subjectExams.stream().mapToDouble(e -> e.getScore() != null ? e.getScore() : 0).sum();
            totalValidExams += subjectExams.size();
        }

        double overallAverage = totalValidExams > 0 ? (totalScoreSum / totalValidExams) : 0;

        // 6. Xây dựng Prompt cho AI
        String systemPrompt = """
                Bạn là một cố vấn học tập đại học (Academic Advisor) tận tâm, am hiểu và giàu kinh nghiệm của trường Học viện Nông nghiệp Việt Nam (VNUA).
                Nhiệm vụ của bạn là đọc dữ liệu thống kê điểm thi trắc nghiệm của sinh viên và đề xuất một Lộ trình học tập (Actionable Roadmap) gồm 3 đến 4 bước hành động cụ thể, thực tế và tạo động lực.
                BẮT BUỘC chỉ trả về kết quả dưới dạng chuỗi JSON thuần túy (không bọc trong markdown code fence, không kèm lời chào hỏi đầu hay cuối).
                """;

        String userPrompt = String.format("""
                Dữ liệu học tập của sinh viên:
                - Tổng số bài thi đã hoàn thành: %d
                - Điểm trung bình tổng quan: %.1f/100
                - Thống kê chi tiết theo môn:
                %s
                
                Hãy phân tích và trả về JSON theo đúng định dạng sau:
                {
                  "summary": "Nhận xét tổng quan về phong độ và xu hướng học tập hiện tại (2-3 câu)",
                  "steps": [
                    {
                      "step": 1,
                      "title": "Tên bước hành động (ngắn gọn, trực quan, ví dụ: 'Cấp bách: Cải thiện điểm môn Tin học đại cương')",
                      "action": "Hướng dẫn cụ thể sinh viên nên ôn chương nào, làm dạng bài gì",
                      "priority": "HIGH", // HIGH (ưu tiên cao nếu điểm < 70), MEDIUM (duy trì điểm khá 70-84), LOW (bứt phá/mở rộng nếu >= 85)
                      "subjectName": "Tên môn học liên quan nếu có"
                    }
                  ]
                }
                """, totalValidExams, overallAverage, statsSummary.toString());

        // 7. Gọi AI
        AiClient client = aiClientRouter.getActiveClient();
        String rawResponse = client.generateExplanation(systemPrompt, userPrompt);

        // 8. Parse JSON và lưu Redis cache
        LearningRoadmapResponse result = parseAiRoadmapResponse(rawResponse, client.getProviderName());

        try {
            String jsonToCache = objectMapper.writeValueAsString(result);
            stringRedisTemplate.opsForValue().set(cacheKey, jsonToCache, ROADMAP_CACHE_TTL);
        } catch (Exception e) {
            log.warn("Redis set roadmap cache error: {}", e.getMessage());
        }

        return result;
    }

    private LearningRoadmapResponse parseAiRoadmapResponse(String rawResponse, String provider) {
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
            String summary = root.path("summary").asText("Lộ trình học tập được cá nhân hóa theo phong độ thi gần đây của bạn.");
            List<RoadmapStepDto> steps = new ArrayList<>();

            JsonNode stepsNode = root.path("steps");
            if (stepsNode.isArray()) {
                int index = 1;
                for (JsonNode s : stepsNode) {
                    steps.add(RoadmapStepDto.builder()
                            .step(s.path("step").asInt(index++))
                            .title(s.path("title").asText("Bước " + (index - 1)))
                            .action(s.path("action").asText(""))
                            .priority(s.path("priority").asText("MEDIUM").toUpperCase())
                            .subjectName(s.path("subjectName").asText(null))
                            .build());
                }
            }

            if (steps.isEmpty()) {
                steps.add(RoadmapStepDto.builder()
                        .step(1)
                        .title("Tiếp tục luyện tập")
                        .action(summary)
                        .priority("MEDIUM")
                        .build());
            }

            return LearningRoadmapResponse.builder()
                    .summary(summary)
                    .steps(steps)
                    .cached(false)
                    .provider(provider)
                    .build();
        } catch (Exception e) {
            log.error("Error parsing AI roadmap JSON: {}, raw response was: {}", e.getMessage(), rawResponse);
            // Fallback: dùng raw text làm summary
            return LearningRoadmapResponse.builder()
                    .summary(cleanJson.length() > 300 ? cleanJson.substring(0, 300) + "..." : cleanJson)
                    .steps(List.of(
                            RoadmapStepDto.builder()
                                    .step(1)
                                    .title("Ôn tập trọng tâm các môn dưới 70 điểm")
                                    .action("Luyện thêm 1 bài kiểm tra ngắn theo chương để củng cố kiến thức.")
                                    .priority("HIGH")
                                    .build(),
                            RoadmapStepDto.builder()
                                    .step(2)
                                    .title("Duy trì nhịp làm bài thi thử")
                                    .action("Dành 15-20 phút mỗi ngày làm đề tổng hợp để tăng phản xạ.")
                                    .priority("MEDIUM")
                                    .build()
                    ))
                    .cached(false)
                    .provider(provider)
                    .build();
        }
    }

    private LearningRoadmapResponse buildOnboardingRoadmap() {
        return LearningRoadmapResponse.builder()
                .summary("Chào mừng bạn đến với hệ thống ôn thi Quiz VNUA! Hãy bắt đầu hành trình bằng một bài thi thử để trợ lý AI có dữ liệu đánh giá năng lực ban đầu nhé.")
                .steps(List.of(
                        RoadmapStepDto.builder()
                                .step(1)
                                .title("Khám phá danh mục môn học")
                                .action("Chọn môn học bạn sắp thi hoặc đang cần ôn tập trong danh mục môn học của trường.")
                                .priority("HIGH")
                                .build(),
                        RoadmapStepDto.builder()
                                .step(2)
                                .title("Làm bài thi thử 15-20 câu đầu tiên")
                                .action("Làm quen cấu trúc đề thi trắc nghiệm và thử sức với các câu hỏi thực tế.")
                                .priority("HIGH")
                                .build(),
                        RoadmapStepDto.builder()
                                .step(3)
                                .title("Xem AI giải thích các câu làm sai")
                                .action("Sau khi nộp bài, bấm '✨ Giải thích bằng AI' ở các câu chưa đúng để lấp lỗ hổng kiến thức ngay.")
                                .priority("MEDIUM")
                                .build(),
                        RoadmapStepDto.builder()
                                .step(4)
                                .title("Duy trì chuỗi ngày ôn tập")
                                .action("Luyện tập đều đặn hàng ngày để sẵn sàng cho kỳ thi kết thúc học phần đạt điểm cao.")
                                .priority("LOW")
                                .build()
                ))
                .cached(true)
                .provider("system")
                .build();
    }
}
