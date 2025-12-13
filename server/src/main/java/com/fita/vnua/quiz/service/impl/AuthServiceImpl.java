package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.RefreshToken;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.RefreshTokenRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    /**
     * Hàm 1: Chỉ lấy thông tin User để trả về cho Client hiển thị (Avatar, Name...)
     * AccessToken và RefreshToken trong object này sẽ để NULL (vì đã gửi qua Cookie)
     */
    @Override
    public AuthResponse createAuthResponse(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userDetails.getUsername()));

        return AuthResponse.builder()
                .accessToken(null)  // Không gửi token ở body
                .refreshToken(null) // Không gửi token ở body
                .tokenType(null)
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Hàm 2: Tạo chuỗi JWT Access Token
     */
    @Override
    public String generateAccessToken(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId().toString());
        claims.put("role", user.getRole().name());

        return jwtTokenUtil.generateToken(claims, userDetails.getUsername());
    }

    /**
     * Hàm 3: Tạo Refresh Token (Lưu DB + Trả về chuỗi UUID)
     */
    @Override
    @Transactional
    public String generateRefreshToken(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // (Option) Xóa các token cũ nếu muốn mỗi user chỉ có 1 session
        // refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID())
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return refreshToken.getToken().toString();
    }

    /**
     * Hàm 4: Refresh Access Token (Check UUID trong DB -> Tạo JWT mới)
     */
    @Override
    public String refreshAccessToken(UUID refreshTokenId) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevoked(refreshTokenId, false)
                .orElseThrow(() -> new RuntimeException("Refresh token không tồn tại hoặc đã bị thu hồi"));

        if (refreshToken.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(refreshToken); // Xóa token hết hạn
            throw new RuntimeException("Refresh token đã hết hạn");
        }

        User user = refreshToken.getUser();

        // Tạo lại UserDetails đơn giản để truyền vào hàm generateAccessToken
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword() != null ? user.getPassword() : "",
                Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        return generateAccessToken(userDetails);
    }

    /**
     * Hàm 5: Revoke (Logout)
     */
    @Override
    public void revokeRefreshToken(UUID tokenId) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevoked(tokenId, false)
                .orElse(null);

        if (refreshToken != null) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
        }
    }
}