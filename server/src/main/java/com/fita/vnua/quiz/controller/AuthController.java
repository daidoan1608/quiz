package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.*;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.dto.response.TokenRefreshResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AuthService;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.impl.GoogleIdTokenVerifierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/")
@RequiredArgsConstructor
@Tag(name = "Authencation API", description = "API thao tác liên quan bảo mật của người dùng")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("login")
    @Operation(summary = "API đăng nhập")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            AuthResponse response = authService.createAuthResponse(userDetails);

            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication failed", List.of(e.getMessage())));
        }
    }


    @PostMapping("refresh")
    @Operation(summary = "API lấy lại access token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshAccessToken(@RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        try {
            String newAccessToken = authService.refreshAccessToken(UUID.fromString(refreshToken));
            TokenRefreshResponse response = new TokenRefreshResponse(newAccessToken);
            return ResponseEntity.ok(ApiResponse.success("Access token refreshed successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage(), List.of(e.getMessage())));
        }
    }


    @PostMapping("logout")
    @Operation(summary = "API đăng xuất")
    public ResponseEntity<ApiResponse<Object>> logout(@RequestBody LogoutRequest request) {
        String refreshTokenId = request.getRefreshToken();

        try {
            authService.revokeRefreshToken(UUID.fromString(refreshTokenId));
            return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Logout failed", List.of(e.getMessage())));
        }
    }


    @PostMapping("register")
    @Operation(summary = "API đăng ký tài khoản")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userService.isEmailExisted(registerRequest.getEmail()))
                return ResponseEntity.status(400).body(ApiResponse.error("Email is already existed", List.of("Email already exists")));

            if (userService.isUsernameExisted(registerRequest.getUsername()))
                return ResponseEntity.status(400).body(ApiResponse.error("Username is already existed", List.of("Username already exists")));

            UserDto user = new UserDto();
            user.setUsername(registerRequest.getUsername());
            String rawPassword = registerRequest.getPassword(); // Lưu password gốc
            user.setPassword(registerRequest.getPassword());
            user.setEmail(registerRequest.getEmail());
            user.setFullName(registerRequest.getFullName());
            user.setRole(User.Role.USER);
            userService.create(user);

            // Tự động đăng nhập sau khi đăng ký
            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                registerRequest.getUsername(),
                                rawPassword
                        )
                );

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                AuthResponse response = authService.createAuthResponse(userDetails);
                return ResponseEntity.ok(ApiResponse.success("Registration successful", response));

            } catch (AuthenticationException e) {
                return ResponseEntity.status(401)
                        .body(ApiResponse.error("Authentication failed after registration", List.of(e.getMessage())));
            }

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage(), List.of(e.getMessage())));
        }
    }

}