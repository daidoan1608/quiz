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
}
