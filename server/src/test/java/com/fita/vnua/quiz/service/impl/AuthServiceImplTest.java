package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.result.RefreshTokenResult;
import com.fita.vnua.quiz.model.entity.RefreshToken;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.model.enums.UserRole;
import com.fita.vnua.quiz.repository.RefreshTokenRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.CustomUserDetailsService;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AdminCapabilityService;
import com.fita.vnua.quiz.service.AuditLogService;
import com.fita.vnua.quiz.service.EmailVerificationService;
import com.fita.vnua.quiz.service.GoogleIdTokenVerifierService;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtTokenUtil jwtTokenUtil;
    @Mock
    private UserMapper userMapper;
    @Mock
    private AdminCapabilityService adminCapabilityService;
    @Mock
    private UserService userService;
    @Mock
    private EmailVerificationService emailVerificationService;
    @Mock
    private GoogleIdTokenVerifierService googleVerifier;
    @Mock
    private CustomUserDetailsService customUserDetailsService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CacheManager cacheManager;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private Cache userDetailsCache;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setUserId(userId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.USER);
        testUser.setDeleted(false);

        ReflectionTestUtils.setField(authService, "refreshTokenExpiration", 604800000L);
    }

    @Test
    void refreshTokens_Success_RotatesTokenAndReturnsBoth() {
        UUID oldTokenId = UUID.randomUUID();
        RefreshToken oldToken = RefreshToken.builder()
                .token(oldTokenId)
                .user(testUser)
                .expiryDate(new Date(System.currentTimeMillis() + 100000))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(oldTokenId)).thenReturn(Optional.of(oldToken));
        when(jwtTokenUtil.generateToken(any(), eq("testuser"))).thenReturn("new-access-jwt");

        RefreshTokenResult result = authService.refreshTokens(oldTokenId);

        assertThat(result).isNotNull();
        assertThat(result.accessToken()).isEqualTo("new-access-jwt");
        assertThat(result.refreshToken()).isNotNull();
        assertThat(result.refreshToken()).isNotEqualTo(oldTokenId.toString());

        // Old token should be marked as revoked
        assertThat(oldToken.isRevoked()).isTrue();

        // Verify save was called for old token and new token
        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, times(2)).save(tokenCaptor.capture());

        RefreshToken savedNewToken = tokenCaptor.getAllValues().get(1);
        assertThat(savedNewToken.isRevoked()).isFalse();
        assertThat(savedNewToken.getUser()).isEqualTo(testUser);
    }

    @Test
    void refreshTokens_TokenReuseDetected_RevokesAllSessionsAndLogsSecurityEvent() {
        UUID reusedTokenId = UUID.randomUUID();
        RefreshToken reusedToken = RefreshToken.builder()
                .token(reusedTokenId)
                .user(testUser)
                .expiryDate(new Date(System.currentTimeMillis() + 100000))
                .revoked(true) // Already revoked!
                .build();

        when(refreshTokenRepository.findByToken(reusedTokenId)).thenReturn(Optional.of(reusedToken));
        when(cacheManager.getCache("userDetails")).thenReturn(userDetailsCache);

        assertThatThrownBy(() -> authService.refreshTokens(reusedTokenId))
                .isInstanceOf(CustomApiException.class)
                .satisfies(ex -> {
                    CustomApiException apiEx = (CustomApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(apiEx.getMessage()).contains("hành vi bất thường");
                });

        // Security event must be recorded
        verify(auditLogService).recordSecurityEvent(
                eq("REFRESH_TOKEN_REUSE_DETECTED"),
                eq("testuser"),
                anyString()
        );

        // All tokens for the user must be revoked
        verify(refreshTokenRepository).revokeAllByUserId(userId);

        // User cache must be evicted
        verify(userDetailsCache).evictIfPresent("testuser");
        verify(userDetailsCache).evictIfPresent("test@example.com");
    }

    @Test
    void refreshTokens_ExpiredToken_DeletesTokenAndThrowsUnauthorized() {
        UUID expiredTokenId = UUID.randomUUID();
        RefreshToken expiredToken = RefreshToken.builder()
                .token(expiredTokenId)
                .user(testUser)
                .expiryDate(new Date(System.currentTimeMillis() - 5000)) // Expired in the past
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(expiredTokenId)).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.refreshTokens(expiredTokenId))
                .isInstanceOf(CustomApiException.class)
                .satisfies(ex -> {
                    CustomApiException apiEx = (CustomApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(apiEx.getMessage()).contains("hết hạn");
                });

        verify(refreshTokenRepository).delete(expiredToken);
    }

    @Test
    void refreshTokens_DeletedUser_RevokesTokenAndThrowsForbidden() {
        testUser.setDeleted(true);
        UUID tokenId = UUID.randomUUID();
        RefreshToken token = RefreshToken.builder()
                .token(tokenId)
                .user(testUser)
                .expiryDate(new Date(System.currentTimeMillis() + 100000))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenId)).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.refreshTokens(tokenId))
                .isInstanceOf(CustomApiException.class)
                .satisfies(ex -> {
                    CustomApiException apiEx = (CustomApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                });

        assertThat(token.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(token);
    }

    @Test
    void revokeRefreshToken_Success() {
        UUID tokenId = UUID.randomUUID();
        RefreshToken token = RefreshToken.builder()
                .token(tokenId)
                .user(testUser)
                .expiryDate(new Date(System.currentTimeMillis() + 100000))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenAndRevoked(tokenId, false)).thenReturn(Optional.of(token));

        authService.revokeRefreshToken(tokenId);

        assertThat(token.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(token);
    }
}
