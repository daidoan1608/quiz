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
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthResponse createAuthResponse(OAuth2User oAuth2User) {
        // Lấy thông tin người dùng từ OAuth2User
        String username = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");

        // Kiểm tra nếu người dùng đã có trong hệ thống, nếu chưa thì tạo mới
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(username);
                    newUser.setEmail(email);
                    newUser.setFullName(username);  // Thêm fullName từ OAuth2User
                    return userRepository.save(newUser);
                });

        // Tạo AccessToken và RefreshToken
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        // Trả về AuthResponse
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    public AuthResponse createAuthResponse(UserDetails userDetails) {
        // Tạo AccessToken và RefreshToken
        String accessToken = generateAccessToken(userDetails);
        String refreshToken = generateRefreshToken(userDetails);

        // Lấy thông tin người dùng từ database
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Xây dựng AuthResponse
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    public String generateAccessToken(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId().toString());
        claims.put("role", user.getRole().name());

        return jwtTokenUtil.generateToken(claims, userDetails.getUsername());
    }

    public Boolean validateAccessToken(String token, UserDetails userDetails) {
        return jwtTokenUtil.validateToken(token, userDetails);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String tokenId = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.fromString(tokenId))
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return tokenId;
    }

    public String refreshAccessToken(UUID refreshTokenId) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevoked(refreshTokenId, false)
                .orElseThrow(() -> new RuntimeException("Refresh token không tồn tại hoặc đã bị thu hồi"));

        if (refreshToken.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token đã hết hạn");
        }

        User user = refreshToken.getUser();
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(
                        new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                )
        );

        return generateAccessToken(userDetails);
    }

    public void revokeRefreshToken(UUID tokenId) {
        RefreshToken refreshToken = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Refresh token không tồn tại"));
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }
}