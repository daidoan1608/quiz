package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.entity.User;
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
    private String tokenType = "Bearer";
    private UUID userId;
    private String username;
    private String email;
    private String fullName;
    private User.Role role;
    private String avatarUrl;
}