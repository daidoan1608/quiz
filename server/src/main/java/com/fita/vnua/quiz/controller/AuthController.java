package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.*;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.dto.response.TokenRefreshResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.impl.AuthService;
import com.fita.vnua.quiz.service.impl.OtpServiceImpl;
import com.fita.vnua.quiz.service.impl.UserServiceImpl;
import jakarta.validation.constraints.Null;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final UserServiceImpl userService;
    private final PasswordEncoder passwordEncoder;
    private final OtpServiceImpl otpServiceImpl;
    private final UserRepository userRepository;

    @PostMapping("/change-password/{userId}")
    public ResponseEntity<?> changePassword(@PathVariable("userId") UUID userId,
                                            @RequestBody ChangePasswordRequest request) {
        try {
            // Lấy userId từ token của người dùng hiện tại
            UserDto userDto = userService.getUserById(userId);

            // Kiểm tra quyền sở hữu
            if (!passwordEncoder.matches(request.getOldPassword(),userDto.getPassword()) || !userDto.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "You are not authorized to change this password"));
            }

            userDto.setPassword(request.getNewPassword());
            userService.update(userId, userDto);

            return ResponseEntity.ok(Response.builder()
                    .responseCode("200 OK")
                    .responseMessage("Password changed successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Change password failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // Lấy UserDetails từ authentication để tạo token
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        AuthResponse response = authService.createAuthResponse(userDetails);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        try {
            String newAccessToken = authService.refreshAccessToken(UUID.fromString(refreshToken));

            TokenRefreshResponse response = new TokenRefreshResponse(newAccessToken);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
        String refreshTokenId = request.getRefreshToken();

        try {
            authService.revokeRefreshToken(UUID.fromString(refreshTokenId));
            return ResponseEntity.ok(Response.builder().responseCode("200 OK").responseMessage("Logout successful").build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userService.isEmailExisted(registerRequest.getEmail()))
                return ResponseEntity.status(400).body(Map.of("error", "Email is already existed"));

            if (userService.isUsernameExisted(registerRequest.getUsername()))
                return ResponseEntity.status(400).body(Map.of("error", "Username is already existed"));


            UserDto user = new UserDto();
            user.setUsername(registerRequest.getUsername());
            String rawPassword = registerRequest.getPassword(); // Lưu password gốc
            user.setPassword(registerRequest.getPassword());
            user.setEmail(registerRequest.getEmail());
            user.setFullName(registerRequest.getFullName());
            user.setRole(User.Role.USER);
            userService.create(user);

            // Tự động đăng nhập
            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                registerRequest.getUsername(),
                                rawPassword  // Dùng password gốc
                        )
                );

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                AuthResponse response = authService.createAuthResponse(userDetails);
                return ResponseEntity.ok(response);

            } catch (AuthenticationException e) {
                // Log lỗi authentication
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Authentication failed after registration: " + e.getMessage()));
            }

        } catch (Exception e) {
            // Log lỗi
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    // Gửi OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(otpServiceImpl.generateOtp(request.getEmail()));
    }

    // Đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Email không tồn tại.");
        if (request.getNewPassword().length() < 6) return ResponseEntity.badRequest().body("Mật khẩu phải có ít nhất 6 ký tự.");

        boolean isVerified = otpServiceImpl.verifyOtp(request.getEmail(),request.getOtp());
        if (isVerified == false) {
            return ResponseEntity.badRequest().body("Mã OTP không hợp lệ.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        User success = userRepository.save(user);
        if (null == success) return ResponseEntity.badRequest().body("Email không hợp lệ.");
        return ResponseEntity.ok("Mật khẩu đã được đặt lại.");
    }

}
