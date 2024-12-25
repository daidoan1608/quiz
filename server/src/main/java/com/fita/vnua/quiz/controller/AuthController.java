package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.LoginRequest;
import com.fita.vnua.quiz.model.dto.request.LogoutRequest;
import com.fita.vnua.quiz.model.dto.request.RefreshTokenRequest;
import com.fita.vnua.quiz.model.dto.request.RegisterRequest;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.dto.response.TokenRefreshResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.impl.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;


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
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setEmail(registerRequest.getEmail());
            user.setFullName(registerRequest.getFullName());
            user.setRole(User.Role.USER);
            userService.create(user);
            // Tự động đăng nhập
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            registerRequest.getUsername(),
                            registerRequest.getPassword()
                    )
            );

            // Lấy UserDetails từ authentication để tạo token
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            AuthResponse response = authService.createAuthResponse(userDetails);


            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
