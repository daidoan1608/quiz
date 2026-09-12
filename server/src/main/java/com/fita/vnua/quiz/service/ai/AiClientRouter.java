package com.fita.vnua.quiz.service.ai;

import com.fita.vnua.quiz.configuration.properties.AiProperties;
import com.fita.vnua.quiz.exception.CustomApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class AiClientRouter {

    private final AiProperties aiProperties;
    private final GeminiAiClient geminiAiClient;
    private final OpenAiCompatibleClient openAiCompatibleClient;

    public AiClient getActiveClient() {
        if (!aiProperties.isEnabled()) {
            throw new CustomApiException("AI_DISABLED", "Tính năng AI hiện đang tạm thời tắt.", HttpStatus.SERVICE_UNAVAILABLE);
        }

        String preferred = aiProperties.getProvider();
        if ("openai".equalsIgnoreCase(preferred)) {
            if (openAiCompatibleClient.isConfigured()) {
                return openAiCompatibleClient;
            }
            if (geminiAiClient.isConfigured()) {
                return geminiAiClient;
            }
            return openAiCompatibleClient; // Will throw informative missing key error
        }

        // Default: gemini
        if (geminiAiClient.isConfigured()) {
            return geminiAiClient;
        }
        if (openAiCompatibleClient.isConfigured()) {
            return openAiCompatibleClient;
        }
        return geminiAiClient; // Will throw informative missing key error
    }
}
