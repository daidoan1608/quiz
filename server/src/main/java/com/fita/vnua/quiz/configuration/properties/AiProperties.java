package com.fita.vnua.quiz.configuration.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(prefix = "app.ai")
@Data
public class AiProperties {
    private boolean enabled = true;
    private String provider = "gemini"; // "gemini" or "openai"

    private GeminiProperties gemini = new GeminiProperties();
    private OpenAiProperties openai = new OpenAiProperties();

    private int rateLimitMaxAttempts = 20;
    private Duration rateLimitWindow = Duration.ofMinutes(10);
    private Duration cacheTtl = Duration.ofDays(7);

    @Data
    public static class GeminiProperties {
        private String apiKey;
        private String model = "gemini-2.0-flash";
        private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    }

    @Data
    public static class OpenAiProperties {
        private String apiKey;
        private String model = "gpt-4o-mini";
        private String baseUrl = "https://api.openai.com/v1";
    }
}
