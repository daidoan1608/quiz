package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.request.ExplainQuestionRequest;
import com.fita.vnua.quiz.model.dto.response.ExplainQuestionResponse;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.security.InMemoryRateLimiter;
import com.fita.vnua.quiz.service.AiExplainService;
import com.fita.vnua.quiz.service.ai.AiClient;
import com.fita.vnua.quiz.service.ai.AiClientRouter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiExplainServiceImpl implements AiExplainService {

    private final QuestionRepository questionRepository;
    private final AiClientRouter aiClientRouter;
    private final AiProperties aiProperties;
    private final InMemoryRateLimiter rateLimiter;
    private final StringRedisTemplate stringRedisTemplate;

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ giảng đại học của Học viện Nông nghiệp Việt Nam (VNUA).
            Nhiệm vụ của bạn là giải thích câu hỏi trắc nghiệm một cách ngắn gọn, súc tích và đi thẳng vào trọng tâm.
            QUY TẮC BẮT BUỘC:
            1. TUYỆT ĐỐI KHÔNG chào hỏi xã giao ở đầu bài (không viết 'Chào các em...', 'Thầy/cô rất vui...').
            2. TUYỆT ĐỐI KHÔNG chúc thi tốt hay chào tạm biệt ở cuối bài.
            3. Đi thẳng trực tiếp vào nội dung phân tích theo đúng cấu trúc yêu cầu, không lan man.
            4. Định dạng Markdown chuẩn: dùng tiêu đề ###, gạch đầu dòng -, in đậm từ khóa quan trọng, công thức LaTeX nếu có.
            """;

    @Override
    @Transactional(readOnly = true)
    public ExplainQuestionResponse explainQuestion(ExplainQuestionRequest request, User currentUser) {
        // 1. Kiểm tra câu hỏi
        Question question = questionRepository.findByQuestionIdAndDeletedFalse(request.getQuestionId())
                .or(() -> questionRepository.findByIdWithDetails(request.getQuestionId()))
                .orElseThrow(() -> new CustomApiException("NOT_FOUND", "Không tìm thấy câu hỏi với ID: " + request.getQuestionId(), HttpStatus.NOT_FOUND));

        // 2. Rate limit kiểm soát tần suất gọi
        String userIdentifier = currentUser != null && currentUser.getUserId() != null
                ? currentUser.getUserId().toString()
                : "anonymous";
        String rateLimitKey = "ai-explain:" + userIdentifier;
        if (!rateLimiter.allow(rateLimitKey, aiProperties.getRateLimitMaxAttempts(), aiProperties.getRateLimitWindow())) {
            throw new CustomApiException("RATE_LIMIT_EXCEEDED",
                    String.format("Bạn đã sử dụng hết lượt hỏi AI (%d lượt trong %d phút). Vui lòng đợi một chút rồi thử lại nhé!",
                            aiProperties.getRateLimitMaxAttempts(), aiProperties.getRateLimitWindow().toMinutes()),
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        // 3. Kiểm tra Redis Cache
        List<Long> selectedIds = request.getSelectedAnswerIds() != null
                ? request.getSelectedAnswerIds().stream().filter(Objects::nonNull).sorted().toList()
                : Collections.emptyList();
        String selectedKeySuffix = selectedIds.isEmpty()
                ? "none"
                : selectedIds.stream().map(String::valueOf).collect(Collectors.joining("-"));
        String cacheKey = String.format("ai:explain:q:%d:sel:%s", question.getQuestionId(), selectedKeySuffix);

        boolean isRefresh = Boolean.TRUE.equals(request.getRefresh());
        if (!isRefresh) {
            try {
                String cachedExplanation = stringRedisTemplate.opsForValue().get(cacheKey);
                if (cachedExplanation != null && !cachedExplanation.isBlank()) {
                    log.info("Returning cached AI explanation for questionId={}", question.getQuestionId());
                    return ExplainQuestionResponse.builder()
                            .questionId(question.getQuestionId())
                            .explanation(cachedExplanation)
                            .cached(true)
                            .provider("cache")
                            .build();
                }
            } catch (Exception e) {
                log.warn("Redis get cache error: {}", e.getMessage());
            }
        }

        // 4. Lấy AI Client đang hoạt động
        AiClient client = aiClientRouter.getActiveClient();

        // 5. Xây dựng prompt chi tiết
        String userPrompt = buildUserPrompt(question, selectedIds);

        // 6. Gọi AI sinh câu trả lời
        log.info("Generating AI explanation for questionId={} using provider={}", question.getQuestionId(), client.getProviderName());
        String explanation = client.generateExplanation(SYSTEM_PROMPT, userPrompt);

        // 7. Lưu vào Redis Cache
        try {
            stringRedisTemplate.opsForValue().set(cacheKey, explanation, aiProperties.getCacheTtl());
        } catch (Exception e) {
            log.warn("Redis set cache error: {}", e.getMessage());
        }

        return ExplainQuestionResponse.builder()
                .questionId(question.getQuestionId())
                .explanation(explanation)
                .cached(false)
                .provider(client.getProviderName())
                .build();
    }

    private String buildUserPrompt(Question question, List<Long> selectedIds) {
        StringBuilder sb = new StringBuilder();

        String subjectName = question.getChapter() != null && question.getChapter().getSubject() != null
                ? question.getChapter().getSubject().getName()
                : "Không xác định";
        String chapterName = question.getChapter() != null
                ? question.getChapter().getName()
                : "Không xác định";

        sb.append("Môn học: ").append(subjectName).append("\n");
        sb.append("Chương/Chủ đề: ").append(chapterName).append("\n\n");
        sb.append("Nội dung câu hỏi:\n").append(question.getContent()).append("\n\n");
        sb.append("Các phương án lựa chọn:\n");

        char optionLetter = 'A';
        List<Answer> answers = question.getAnswers() != null ? question.getAnswers() : Collections.emptyList();
        List<String> studentChosenOptions = new ArrayList<>();

        for (Answer answer : answers) {
            String mark = Boolean.TRUE.equals(answer.getIsCorrect()) ? " [ĐÁP ÁN ĐÚNG]" : "";
            sb.append(String.format("- %c. %s%s\n", optionLetter, answer.getContent(), mark));

            if (selectedIds.contains(answer.getOptionId())) {
                studentChosenOptions.add(String.format("%c (%s)", optionLetter, answer.getContent()));
            }
            optionLetter++;
        }

        sb.append("\n");
        if (!studentChosenOptions.isEmpty()) {
            sb.append("Lựa chọn hiện tại của sinh viên: ").append(String.join(", ", studentChosenOptions)).append("\n\n");
        }

        sb.append("""
                Hãy giải thích thật ngắn gọn, đi thẳng vào trọng tâm bản chất theo cấu trúc Markdown sau:
                ### 1. Đáp án đúng
                - Khẳng định đáp án đúng và giải thích lý do cốt lõi trong đúng 1-2 câu ngắn (tối đa 40 từ).

                ### 2. Vì sao các phương án khác sai
                - Mỗi phương án sai chỉ giải thích bằng đúng 1 dòng ngắn gọn (chỉ ra từ khóa sai hoặc lý do loại trừ).
                """);

        if (!studentChosenOptions.isEmpty()) {
            sb.append("- Nhận xét ngắn về phương án sinh viên đã chọn (nếu chọn sai, chỉ ra bẫy nhầm lẫn trong đúng 1 câu ngắn).\n");
        }

        sb.append("""

                ### 3. Từ khóa cốt lõi
                - Đúng 1 câu ngắn chứa từ khóa/mẹo mấu chốt để nhận diện đáp án khi gặp lại câu hỏi này.
                """);

        return sb.toString();
    }
}
