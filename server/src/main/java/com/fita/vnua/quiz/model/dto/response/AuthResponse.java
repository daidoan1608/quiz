package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UUID userId;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;
    private String avatarUrl;
    private AdminCapabilitiesResponse capabilities;
}
