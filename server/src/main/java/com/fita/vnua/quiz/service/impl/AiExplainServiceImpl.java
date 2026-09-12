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
            Bạn là một trợ giảng đại học xuất sắc, tận tâm và giàu kinh nghiệm của trường Học viện Nông nghiệp Việt Nam (VNUA).
            Nhiệm vụ của bạn là giải thích cặn kẽ câu hỏi trắc nghiệm sau đây cho sinh viên.
            Phong cách trình bày: Sư phạm, rõ ràng, dễ hiểu, súc tích, định dạng bằng Markdown chuẩn đẹp (dùng tiêu đề ###, danh sách gạch đầu dòng, công thức toán/lý/hóa bằng LaTeX nếu có).
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
                Hãy phân tích và giải thích cho sinh viên theo cấu trúc Markdown sau:
                ### 1. Phân tích đáp án đúng
                - Giải thích chi tiết tại sao đáp án đúng là chính xác (dẫn giải lý thuyết, công thức hoặc định lý liên quan).
                
                ### 2. Phân tích các phương án còn lại
                - Chỉ ra điểm sai, lỗ hổng hoặc bẫy tư duy của các phương án sai.
                """);

        if (!studentChosenOptions.isEmpty()) {
            sb.append("- Nhận xét cụ thể về phương án mà sinh viên đã chọn (nếu sinh viên chọn sai, giải thích vì sao dễ nhầm lẫn sang phương án này).\n");
        }

        sb.append("""
                
                ### 3. Mẹo ghi nhớ & Điểm mấu chốt
                - Đúc kết 1-2 ý ngắn gọn để sinh viên ghi nhớ nhanh và phản xạ tốt khi gặp dạng bài này lần sau.
                """);

        return sb.toString();
    }
}
