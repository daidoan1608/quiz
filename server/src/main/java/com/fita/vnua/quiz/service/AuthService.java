package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.request.RegisterRequest;
import com.fita.vnua.quiz.model.dto.result.AuthRegistrationResult;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public interface AuthService {
    AuthResponse createAuthResponse(UserDetails userDetails);

    String generateAccessToken(UserDetails userDetails);

    String generateRefreshToken(UserDetails userDetails);

    String refreshAccessToken(UUID refreshTokenId);

    void revokeRefreshToken(UUID tokenId);

    void setPassword(UUID userId, String newPassword);

    AuthRegistrationResult register(RegisterRequest registerRequest);

    UserDetails authenticateGoogleToken(String idToken) throws Exception;

    User findOrCreateGoogleUser(String email, String name, String picture);
}
