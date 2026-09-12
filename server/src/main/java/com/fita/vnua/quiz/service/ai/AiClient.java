package com.fita.vnua.quiz.service.ai;

public interface AiClient {
    String generateExplanation(String systemPrompt, String userPrompt);
    String getProviderName();
    boolean isConfigured();
}
