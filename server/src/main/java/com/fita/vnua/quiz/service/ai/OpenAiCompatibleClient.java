package com.fita.vnua.quiz.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.exception.CustomApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component("openAiCompatibleClient")
public class OpenAiCompatibleClient implements AiClient {

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public OpenAiCompatibleClient(AiProperties aiProperties, ObjectMapper objectMapper) {
        this.aiProperties = aiProperties;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(60));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public String getProviderName() {
        return "openai";
    }

    @Override
    public boolean isConfigured() {
        return StringUtils.hasText(aiProperties.getOpenai().getApiKey());
    }

    @Override
    public String generateExplanation(String systemPrompt, String userPrompt) {
        String apiKey = aiProperties.getOpenai().getApiKey();
        if (!StringUtils.hasText(apiKey)) {
            throw new CustomApiException("AI_NOT_CONFIGURED", "Chưa cấu hình API Key cho OpenAI/DeepSeek.",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }

        String model = StringUtils.hasText(aiProperties.getOpenai().getModel()) ? aiProperties.getOpenai().getModel()
                : "gpt-4o-mini";
        String baseUrl = StringUtils.hasText(aiProperties.getOpenai().getBaseUrl())
                ? aiProperties.getOpenai().getBaseUrl()
                : "https://api.openai.com/v1";
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String url = baseUrl + "/chat/completions";

        List<Map<String, String>> messages = new ArrayList<>();
        if (StringUtils.hasText(systemPrompt)) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }
        messages.add(Map.of("role", "user", "content", userPrompt));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 2048);

        try {
            String rawResponse = restClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (!StringUtils.hasText(rawResponse)) {
                throw new CustomApiException("AI_EMPTY_RESPONSE", "Không nhận được phản hồi từ AI service.",
                        HttpStatus.BAD_GATEWAY);
            }

            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode message = choices.get(0).path("message");
                String content = message.path("content").asText("");
                if (StringUtils.hasText(content)) {
                    return content;
                }
            }

            log.warn("OpenAI unexpected response structure: {}", rawResponse);
            throw new CustomApiException("AI_PARSE_ERROR", "Định dạng phản hồi AI không đúng kỳ vọng.",
                    HttpStatus.BAD_GATEWAY);
        } catch (CustomApiException e) {
            throw e;
        } catch (RestClientResponseException e) {
            log.error("OpenAI API returned error: HTTP {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 429) {
                throw new CustomApiException("AI_RATE_LIMIT",
                        "Dịch vụ OpenAI/DeepSeek đang quá tải hoặc hết hạn mức. Vui lòng thử lại sau.",
                        HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new CustomApiException("AI_SERVICE_ERROR", "OpenAI compatible API phản hồi lỗi: " + e.getStatusCode(),
                    HttpStatus.BAD_GATEWAY);
        } catch (Exception e) {
            log.error("Error calling OpenAI compatible API: {}", e.getMessage(), e);
            throw new CustomApiException("AI_SERVICE_ERROR", "Không thể kết nối đến AI service: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY);
        }
    }
}
