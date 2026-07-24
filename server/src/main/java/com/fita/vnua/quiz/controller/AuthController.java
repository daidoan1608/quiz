package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.request.*;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.dto.result.AuthRegistrationResult;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.security.CustomUserDetailsService;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AuthService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService customUserDetailsService;
    private final com.fita.vnua.quiz.service.EmailVerificationService emailVerificationService;

    @PostMapping("login")
    @Operation(summary = "API đăng nhập (Trả về HttpOnly Cookie)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            customUserDetailsService.ensurePasswordConfigured(loginRequest.getUsername());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return buildAuthenticatedResponse("Đăng nhập thành công", userDetails);
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(
                            "FORBIDDEN",
                            "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
                            List.of("Tài khoản đã bị vô hiệu hóa")
                    ));
        } catch (CustomApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(ApiResponse.error(e.getCode(), e.getMessage(), List.of(e.getMessage())));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(
                            "INVALID_CREDENTIALS",
                            "Tên đăng nhập/email hoặc mật khẩu không đúng",
                            List.of("Thông tin đăng nhập không hợp lệ")
                    ));
        }
    }

    @PatchMapping("password")
    @Operation(summary = "API thiết lập mật khẩu cho tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<Object>> setPassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SetPasswordRequest request
    ) {
        if (currentUser == null) {
            throw new CustomApiException("Vui lòng đăng nhập để tiếp tục", HttpStatus.UNAUTHORIZED);
        }
        authService.setPassword(currentUser.getUserId(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đã thiết lập mật khẩu thành công. Bạn có thể đăng nhập bằng tài khoản + mật khẩu.", null));
    }

    @GetMapping("me")
    @Operation(summary = "API lấy thông tin người dùng đang đăng nhập")
    public ResponseEntity<ApiResponse<AuthResponse>> me(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new CustomApiException("Vui lòng đăng nhập để tiếp tục", HttpStatus.UNAUTHORIZED);
        }
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(currentUser.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", authService.createAuthResponse(userDetails)));
    }

    @PostMapping("refresh")
    @Operation(summary = "API lấy lại access token (Dùng Cookie RefreshToken)")
    public ResponseEntity<ApiResponse<Object>> refreshAccessToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new CustomApiException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED);
        }

        String newAccessToken = authService.refreshAccessToken(UUID.fromString(refreshToken));
        ResponseCookie newAccessCookie = jwtTokenUtil.generateAccessJwtCookie(newAccessToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                .body(ApiResponse.success("Làm mới phiên đăng nhập thành công", null));
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
                .body(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("register")
    @Operation(summary = "API đăng ký tài khoản (Gửi email xác thực)")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthRegistrationResult result = authService.register(registerRequest);
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK)
                .body(ApiResponse.success(result.message(), null));
    }

    @GetMapping("verify-email")
    @Operation(summary = "API xác thực email tài khoản bằng token")
    public ResponseEntity<ApiResponse<Object>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Xác thực email thành công", null));
    }

    @PostMapping("google")
    @Operation(summary = "API đăng nhập bằng Google (Nhận Google ID Token, Trả về HttpOnly Cookie)")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@RequestBody Map<String, String> body) throws Exception {
        UserDetails userDetails = authService.authenticateGoogleToken(body.get("idToken"));
        return buildAuthenticatedResponse("Đăng nhập bằng Google thành công", userDetails);
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
