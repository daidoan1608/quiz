package com.fita.vnua.quiz.model.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IntrospectionRequest {
    private String token;
    private String tokenType; // "access_token" or "refresh_token"
}
