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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "API thao tác liên quan bảo mật của người dùng (Cookie Based)")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil; // Inject thêm JwtTokenUtil

    @PostMapping("login")
    @Operation(summary = "API đăng nhập (Trả về HttpOnly Cookie)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            // 1. Xác thực Username/Password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // 2. Tạo chuỗi Token (Gọi Service)
            String accessToken = authService.generateAccessToken(userDetails);
            String refreshTokenUUID = authService.generateRefreshToken(userDetails);

            // 3. Đóng gói vào Cookie (Gọi Utility)
            ResponseCookie accessCookie = jwtTokenUtil.generateAccessJwtCookie(accessToken);
            ResponseCookie refreshCookie = jwtTokenUtil.generateRefreshJwtCookie(refreshTokenUUID);

            // 4. Lấy thông tin User để hiển thị (Avatar, Name...) - Không chứa Token
            AuthResponse authResponse = authService.createAuthResponse(userDetails);
            authResponse.setAccessToken(accessToken);         // Gán token vào body
            authResponse.setRefreshToken(refreshTokenUUID);

            // 5. Trả về Response kèm Header Set-Cookie
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(ApiResponse.success("Login successful", authResponse));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication failed", List.of(e.getMessage())));
        }
    }

    @PostMapping("refresh")
    @Operation(summary = "API lấy lại access token (Dùng Cookie RefreshToken)")
    public ResponseEntity<?> refreshAccessToken(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest // Thêm cái này để Mobile gửi JSON
    ) {
        String refreshToken = null;

        // Ưu tiên lấy từ Cookie
        if (cookieRefreshToken != null && !cookieRefreshToken.isEmpty()) {
            refreshToken = cookieRefreshToken;
        }
        // Nếu không có cookie, lấy từ Body (cho Mobile)
        else if (bodyRequest != null) {
            refreshToken = bodyRequest.getRefreshToken();
        }

        if (refreshToken == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Refresh token is empty", List.of("Not found refresh token")));
        }

        // ... Logic refresh token như cũ ...
        String newAccessToken = authService.refreshAccessToken(UUID.fromString(refreshToken));

        // Trả về cả Cookie (cho Web update) và Body (cho Mobile update)
        ResponseCookie newAccessCookie = jwtTokenUtil.generateAccessJwtCookie(newAccessToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                .body(ApiResponse.success("Refreshed", new TokenRefreshResponse(newAccessToken)));
    }

    @PostMapping("logout")
    @Operation(summary = "API đăng xuất (Xóa Cookie)")
    public ResponseEntity<ApiResponse<Object>> logout(
            @CookieValue(name = "refreshToken", defaultValue = "") String refreshTokenStr) {

        // 1. Revoke trong DB (Nếu cookie có tồn tại)
        if (!refreshTokenStr.isEmpty()) {
            try {
                authService.revokeRefreshToken(UUID.fromString(refreshTokenStr));
            } catch (Exception e) {
                // Log lỗi nếu cần, nhưng vẫn tiếp tục xóa cookie ở client
            }
        }

        // 2. Tạo cookie rỗng để Client xóa token lưu trong trình duyệt
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
        try {
            if (userService.isEmailExisted(registerRequest.getEmail()))
                return ResponseEntity.status(400).body(ApiResponse.error("Email is already existed", List.of("Email already exists")));

            if (userService.isUsernameExisted(registerRequest.getUsername()))
                return ResponseEntity.status(400).body(ApiResponse.error("Username is already existed", List.of("Username already exists")));

            UserDto user = new UserDto();
            user.setUsername(registerRequest.getUsername());
            String rawPassword = registerRequest.getPassword();
            user.setPassword(registerRequest.getPassword());
            user.setEmail(registerRequest.getEmail());
            user.setFullName(registerRequest.getFullName());
            user.setRole(User.Role.USER);
            userService.create(user);

            // Tự động đăng nhập sau khi đăng ký
            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), rawPassword)
                );

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();

                // Logic tạo Cookie giống Login
                String accessToken = authService.generateAccessToken(userDetails);
                String refreshTokenUUID = authService.generateRefreshToken(userDetails);

                ResponseCookie accessCookie = jwtTokenUtil.generateAccessJwtCookie(accessToken);
                ResponseCookie refreshCookie = jwtTokenUtil.generateRefreshJwtCookie(refreshTokenUUID);

                AuthResponse userInfo = authService.createAuthResponse(userDetails);

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                        .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                        .body(ApiResponse.success("Registration successful", userInfo));

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