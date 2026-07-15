package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.RefreshToken;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.RefreshTokenRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AuthService;
import com.fita.vnua.quiz.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserMapper userMapper;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    @Override
    public AuthResponse createAuthResponse(UserDetails userDetails) {
        User user = getUserByUsername(userDetails.getUsername());
        return userMapper.toAuthResponse(user);
    }

    @Override
    public String generateAccessToken(UserDetails userDetails) {
        User user = getUserByUsername(userDetails.getUsername());

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId().toString());
        claims.put("role", user.getRole().name());

        return jwtTokenUtil.generateToken(claims, userDetails.getUsername());
    }

    @Override
    @Transactional
    public String generateRefreshToken(UserDetails userDetails) {
        User user = getUserByUsername(userDetails.getUsername());

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID())
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken().toString();
    }

    @Override
    public String refreshAccessToken(UUID refreshTokenId) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevoked(refreshTokenId, false)
                .orElseThrow(() -> new CustomApiException("Refresh token không tồn tại hoặc đã bị thu hồi", HttpStatus.UNAUTHORIZED));

        if (refreshToken.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(refreshToken);
            throw new CustomApiException("Refresh token đã hết hạn", HttpStatus.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword() != null ? user.getPassword() : "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        return generateAccessToken(userDetails);
    }

    @Override
    public void revokeRefreshToken(UUID tokenId) {
        refreshTokenRepository.findByTokenAndRevoked(tokenId, false)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }

    @Override
    @Transactional
    public User findOrCreateGoogleUser(String email, String name, String picture) {
        return userRepository.findByEmail(email)
                .map(user -> syncGoogleProfile(user, name, picture))
                .orElseGet(() -> createGoogleUser(email, name, picture));
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private User createGoogleUser(String email, String name, String picture) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(generateUniqueGoogleUsername(email));
        user.setFullName(name);
        user.setRole(User.Role.USER);
        user.setAuthProvider(User.AuthProvider.GOOGLE);
        user.setEmailVerified(true);
        user.setPassword(null);
        user.setAvatarUrl(picture);
        return userRepository.save(user);
    }

    private User syncGoogleProfile(User user, String name, String picture) {
        boolean changed = false;
        if (user.getAuthProvider() != User.AuthProvider.GOOGLE) {
            user.setAuthProvider(User.AuthProvider.GOOGLE);
            changed = true;
        }
        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            changed = true;
        }
        if (name != null && !name.equals(user.getFullName())) {
            user.setFullName(name);
            changed = true;
        }
        if (picture != null && !picture.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(picture);
            changed = true;
        }
        return changed ? userRepository.save(user) : user;
    }

    private String generateUniqueGoogleUsername(String email) {
        String localPart = email.split("@", 2)[0].replaceAll("[^a-zA-Z0-9_]", "_");
        if (localPart.isBlank()) {
            localPart = "google_user";
        }

        String base = localPart.length() > 20 ? localPart.substring(0, 20) : localPart;
        String username = base;
        int suffix = 1;
        while (userRepository.existsUserByUsername(username)) {
            String suffixText = "_" + suffix++;
            int maxBaseLength = Math.max(1, 20 - suffixText.length());
            username = base.substring(0, Math.min(base.length(), maxBaseLength)) + suffixText;
        }
        return username;
    }
}
