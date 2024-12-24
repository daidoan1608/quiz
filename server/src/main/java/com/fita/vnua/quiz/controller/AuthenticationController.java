package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.AuthenticationRequest;
import com.fita.vnua.quiz.model.dto.request.IntrospectionRequest;
import com.fita.vnua.quiz.model.dto.request.RefreshTokenRequest;
import com.fita.vnua.quiz.model.dto.response.AuthenticationResponse;
import com.fita.vnua.quiz.model.dto.response.IntrospectionResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.CustomUserDetailsService;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) {
        try {
            // Authenticate the user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authenticationRequest.getUsername(),
                            authenticationRequest.getPassword()
                    )
            );

            // Load user details
            final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());

            // Generate tokens
            final String accessToken = jwtTokenUtil.generateAccessToken(userDetails);
            final String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);

            // Return tokens
            return ResponseEntity.ok(new AuthenticationResponse(accessToken, refreshToken));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();
            // Extract username from refresh token
            String username = jwtTokenUtil.getUsernameFromToken(refreshToken);

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate refresh token
            if (jwtTokenUtil.validateToken(refreshToken, userDetails)) {
                // Generate new access token
                String newAccessToken = jwtTokenUtil.generateAccessToken(userDetails);

                return ResponseEntity.ok(new AuthenticationResponse(newAccessToken, refreshToken));
            } else {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid refresh token");
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Token refresh failed: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDto registrationRequest) {
        // Check if username already exists
        if (userRepository.findByUsername(registrationRequest.getUsername()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Username already exists");
        }

        // Check if email already exists (if email is used)
        if (registrationRequest.getEmail() != null &&
                userRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email already exists");
        }

        // Create new user
        User newUser = new User();
        newUser.setUsername(registrationRequest.getUsername());
        newUser.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        newUser.setEmail(registrationRequest.getEmail());
        newUser.setFullName(registrationRequest.getFullName());

        // Set default role if not provided
        newUser.setRole(registrationRequest.getRole() != null
                ? registrationRequest.getRole()
                : User.Role.USER);

        // Save user
        userRepository.save(newUser);

        // Generate token for the new user
        final UserDetails userDetails = userDetailsService.loadUserByUsername(newUser.getUsername());
        final String accessToken = jwtTokenUtil.generateAccessToken(userDetails);
        final String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);

        // Return token
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthenticationResponse(accessToken, refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody String refreshToken) {
        try {
            // Validate refresh token
            String username = jwtTokenUtil.getUsernameFromToken(refreshToken);

            // Kiểm tra tính hợp lệ của refresh token
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtTokenUtil.validateToken(refreshToken, userDetails)) {
                // TODO: Implement token blacklisting or storage-based invalidation
                // Ví dụ:
                // - Lưu token vào danh sách đen
                // - Xóa token khỏi cơ sở dữ liệu lưu trữ token

                return ResponseEntity.ok("Logged out successfully");
            } else {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid refresh token");
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Logout failed: " + e.getMessage());
        }
    }
    @PostMapping("/introspect")
    public ResponseEntity<?> introspectToken(@RequestBody IntrospectionRequest request) {
        try {
            String token = request.getToken();
            String tokenType = request.getTokenType(); // "access_token" or "refresh_token"

            // Extract token claims
            String username = jwtTokenUtil.getUsernameFromToken(token);
            Date expirationDate = jwtTokenUtil.getExpirationDateFromToken(token);
            Date issuedAt = jwtTokenUtil.getClaimFromToken(token, Claims::getIssuedAt);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate token
            boolean isValid = jwtTokenUtil.validateToken(token, userDetails);

            // Build introspection response
            IntrospectionResponse response = IntrospectionResponse.builder()
                    .active(isValid)
                    .username(username)
                    .tokenType(tokenType)
                    .expirationTime(expirationDate.getTime() / 1000)
                    .issuedAt(issuedAt.getTime() / 1000)
                    .notBefore(issuedAt.getTime() / 1000)
                    .build();

            if (isValid) {
                // Add additional user information if token is valid
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                response.setUserId(user.getUserId());
                response.setEmail(user.getEmail());
                response.setFullName(user.getFullName());
                response.setRole(user.getRole().name());
            }

            return ResponseEntity.ok(response);

        } catch (ExpiredJwtException e) {
            return ResponseEntity.ok(IntrospectionResponse.builder()
                    .active(false)
                    .error("expired_token")
                    .errorDescription("The token has expired")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.ok(IntrospectionResponse.builder()
                    .active(false)
                    .error("invalid_token")
                    .errorDescription(e.getMessage())
                    .build());
        }
    }
}
