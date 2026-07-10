package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.*;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.security.CustomUserDetailsService;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AuthService;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.impl.GoogleIdTokenVerifierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "API thao tác liên quan bảo mật của người dùng (Cookie Based)")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final GoogleIdTokenVerifierService googleVerifier;
    private final CustomUserDetailsService customUserDetailsService;

    @PostMapping("login")
    @Operation(summary = "API đăng nhập (Trả về HttpOnly Cookie)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return buildAuthenticatedResponse("Login successful", userDetails);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication failed", List.of("Invalid username or password")));
        }
    }

    @PostMapping("refresh")
    @Operation(summary = "API lấy lại access token (Dùng Cookie RefreshToken)")
    public ResponseEntity<ApiResponse<Object>> refreshAccessToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new CustomApiException("Refresh token is empty", HttpStatus.UNAUTHORIZED);
        }

        String newAccessToken = authService.refreshAccessToken(UUID.fromString(refreshToken));
        ResponseCookie newAccessCookie = jwtTokenUtil.generateAccessJwtCookie(newAccessToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                .body(ApiResponse.success("Refreshed", null));
    }

    @PostMapping("logout")
    @Operation(summary = "API đăng xuất (Xóa Cookie)")
    public ResponseEntity<ApiResponse<Object>> logout(
            @CookieValue(name = "refreshToken", defaultValue = "") String refreshToken
    ) {
        if (!refreshToken.isBlank()) {
            authService.revokeRefreshToken(UUID.fromString(refreshToken));
        }

        ResponseCookie cleanAccess = jwtTokenUtil.getCleanJwtCookie();
        ResponseCookie cleanRefresh = jwtTokenUtil.getCleanRefreshJwtCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanAccess.toString())
                .header(HttpHeaders.SET_COOKIE, cleanRefresh.toString())
                .body(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("register")
    @Operation(summary = "API đăng ký tài khoản (Auto Login Cookie)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest registerRequest) {
        if (userService.isEmailExisted(registerRequest.getEmail())) {
            throw new CustomApiException("Email is already existed", HttpStatus.BAD_REQUEST);
        }
        if (userService.isUsernameExisted(registerRequest.getUsername())) {
            throw new CustomApiException("Username is already existed", HttpStatus.BAD_REQUEST);
        }

        UserDto user = new UserDto();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setRole(User.Role.USER);
        userService.create(user);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return buildAuthenticatedResponse("Registration successful", userDetails);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication failed after registration", List.of("Authentication failed after registration")));
        }
    }

    @PostMapping("google")
    @Operation(summary = "API đăng nhập bằng Google (Nhận Google ID Token, Trả về HttpOnly Cookie)")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@RequestBody Map<String, String> body) throws Exception {
        String idToken = body.get("idToken");
        if (!googleVerifier.verify(idToken)) {
            throw new CustomApiException("Invalid Google ID Token", HttpStatus.UNAUTHORIZED);
        }

        String email = googleVerifier.extractEmail(idToken);
        String name = googleVerifier.extractName(idToken);
        String picture = googleVerifier.extractPicture(idToken);
        User user = authService.findOrCreateGoogleUser(email, name, picture);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getUsername());
        return buildAuthenticatedResponse("Google login successful", userDetails);
    }

    private ResponseEntity<ApiResponse<AuthResponse>> buildAuthenticatedResponse(String message, UserDetails userDetails) {
        String accessToken = authService.generateAccessToken(userDetails);
        String refreshTokenUUID = authService.generateRefreshToken(userDetails);
        ResponseCookie accessCookie = jwtTokenUtil.generateAccessJwtCookie(accessToken);
        ResponseCookie refreshCookie = jwtTokenUtil.generateRefreshJwtCookie(refreshTokenUUID);
        AuthResponse authResponse = authService.createAuthResponse(userDetails);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success(message, authResponse));
    }
}
