package com.fita.vnua.quiz.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.exception.CustomApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component("geminiAiClient")
public class GeminiAiClient implements AiClient {

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public GeminiAiClient(AiProperties aiProperties, ObjectMapper objectMapper) {
        this.aiProperties = aiProperties;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(aiProperties.getGemini().getApiKey());
    }

    @Override
    public String generateExplanation(String systemPrompt, String userPrompt) {
        String apiKey = aiProperties.getGemini().getApiKey();
        if (!StringUtils.hasText(apiKey)) {
            throw new CustomApiException("AI_NOT_CONFIGURED", "Chưa cấu hình API Key cho Google Gemini.", HttpStatus.SERVICE_UNAVAILABLE);
        }

        String model = StringUtils.hasText(aiProperties.getGemini().getModel()) ? aiProperties.getGemini().getModel() : "gemini-2.0-flash";
        String baseUrl = StringUtils.hasText(aiProperties.getGemini().getBaseUrl()) ? aiProperties.getGemini().getBaseUrl() : "https://generativelanguage.googleapis.com/v1beta";

        String url = String.format("%s/models/%s:generateContent?key=%s", baseUrl, model, apiKey);

        Map<String, Object> requestBody = new HashMap<>();

        if (StringUtils.hasText(systemPrompt)) {
            requestBody.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemPrompt))
            ));
        }

        requestBody.put("contents", List.of(
                Map.of("parts", List.of(Map.of("text", userPrompt)))
        ));

        requestBody.put("generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 2048
        ));

        try {
            String rawResponse = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (!StringUtils.hasText(rawResponse)) {
                throw new CustomApiException("AI_EMPTY_RESPONSE", "Không nhận được phản hồi từ AI service.", HttpStatus.BAD_GATEWAY);
            }

            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText("");
                }
            }

            log.warn("Gemini unexpected response structure: {}", rawResponse);
            throw new CustomApiException("AI_PARSE_ERROR", "Định dạng phản hồi AI không đúng kỳ vọng.", HttpStatus.BAD_GATEWAY);
        } catch (CustomApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            throw new CustomApiException("AI_SERVICE_ERROR", "Không thể kết nối đến AI service: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }
}
