package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public interface AuthService {
    AuthResponse createAuthResponse(UserDetails userDetails);

    String generateAccessToken(UserDetails userDetails);

    String generateRefreshToken(UserDetails userDetails);

    String refreshAccessToken(UUID refreshTokenId);

    void revokeRefreshToken(UUID tokenId);
}
