package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.security.CustomUserDetailsService;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AuthService;
import com.fita.vnua.quiz.service.EmailVerificationService;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.GoogleIdTokenVerifierService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private AuthService authService;
    @Mock
    private UserService userService;
    @Mock
    private JwtTokenUtil jwtTokenUtil;
    @Mock
    private GoogleIdTokenVerifierService googleVerifier;
    @Mock
    private CustomUserDetailsService customUserDetailsService;
    @Mock
    private EmailVerificationService emailVerificationService;
    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private AuthController authController;

    @Test
    void meReturnsCurrentUser() {
        UUID userId = UUID.randomUUID();
        User currentUser = new User();
        currentUser.setUserId(userId);
        currentUser.setUsername("student");
        AuthResponse authResponse = AuthResponse.builder()
                .userId(userId)
                .username("student")
                .role(UserRole.USER)
                .build();

        when(customUserDetailsService.loadUserByUsername("student")).thenReturn(userDetails);
        when(authService.createAuthResponse(userDetails)).thenReturn(authResponse);

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.me(currentUser);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getUserId()).isEqualTo(userId);
    }

    @Test
    void meRejectsAnonymousUser() {
        assertThatThrownBy(() -> authController.me(null))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Vui lòng đăng nhập để tiếp tục");
    }

    @Test
    void refreshAccessTokenSuccessReturnsRotatedCookies() {
        UUID oldTokenId = UUID.randomUUID();
        UUID newTokenId = UUID.randomUUID();
        com.fita.vnua.quiz.model.dto.result.RefreshTokenResult refreshResult =
                new com.fita.vnua.quiz.model.dto.result.RefreshTokenResult("new-access-token", newTokenId.toString());

        when(authService.refreshTokens(oldTokenId)).thenReturn(refreshResult);
        when(jwtTokenUtil.generateAccessJwtCookie("new-access-token"))
                .thenReturn(org.springframework.http.ResponseCookie.from("accessToken", "new-access-token").path("/").build());
        when(jwtTokenUtil.generateRefreshJwtCookie(newTokenId.toString()))
                .thenReturn(org.springframework.http.ResponseCookie.from("refreshToken", newTokenId.toString()).path("/api/v1/auth").build());
        when(jwtTokenUtil.getCleanLegacyRefreshJwtCookie())
                .thenReturn(org.springframework.http.ResponseCookie.from("refreshToken", "").path("/").maxAge(0).build());

        ResponseEntity<ApiResponse<Object>> response = authController.refreshAccessToken(oldTokenId.toString());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().get(org.springframework.http.HttpHeaders.SET_COOKIE)).hasSize(3);
    }

    @Test
    void refreshAccessTokenRejectsMissingOrBlankCookie() {
        assertThatThrownBy(() -> authController.refreshAccessToken(null))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");

        assertThatThrownBy(() -> authController.refreshAccessToken("   "))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }

    @Test
    void refreshAccessTokenRejectsMalformedToken() {
        assertThatThrownBy(() -> authController.refreshAccessToken("invalid-uuid-string"))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }

    @Test
    void logoutRevokesTokenAndCleansCookies() {
        UUID tokenId = UUID.randomUUID();
        when(jwtTokenUtil.getCleanJwtCookie())
                .thenReturn(org.springframework.http.ResponseCookie.from("accessToken", "").path("/").maxAge(0).build());
        when(jwtTokenUtil.getCleanRefreshJwtCookie())
                .thenReturn(org.springframework.http.ResponseCookie.from("refreshToken", "").path("/api/v1/auth").maxAge(0).build());
        when(jwtTokenUtil.getCleanLegacyRefreshJwtCookie())
                .thenReturn(org.springframework.http.ResponseCookie.from("refreshToken", "").path("/").maxAge(0).build());

        ResponseEntity<ApiResponse<Object>> response = authController.logout(tokenId.toString());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        org.mockito.Mockito.verify(authService).revokeRefreshToken(tokenId);
        assertThat(response.getHeaders().get(org.springframework.http.HttpHeaders.SET_COOKIE)).hasSize(3);
    }
}
