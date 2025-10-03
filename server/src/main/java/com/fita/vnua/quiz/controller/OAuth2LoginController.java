package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AuthService;
import com.fita.vnua.quiz.service.impl.GoogleIdTokenVerifierService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@RequestMapping("api/v2/auth")
@RequiredArgsConstructor
public class OAuth2LoginController {
    private final GoogleIdTokenVerifierService googleVerifier;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepository userRepository;

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body) throws Exception {
        String idToken = body.get("idToken");

        if (!googleVerifier.verify(idToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Google ID Token"));
        }

        String email = googleVerifier.extractEmail(idToken);
        String name = googleVerifier.extractName(idToken);

        // 🔹 Tạo username từ email (phần trước @)
        String generatedUsername = email.split("@")[0];

        // 🔹 Check user trong DB
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(generatedUsername); // 👈 username lấy từ email
            newUser.setFullName(name);
            newUser.setRole(User.Role.USER);
            newUser.setAuthProvider(User.AuthProvider.GOOGLE);
            newUser.setPassword(null); // Google login thì không cần mật khẩu
            return userRepository.save(newUser);
        });

        // Update tên/ảnh nếu cần
        if (!user.getFullName().equals(name)) {
            user.setFullName(name);
            userRepository.save(user);
        }

        // Sinh JWT
        String jwt = jwtTokenUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "email", user.getEmail(),
                "username", user.getUsername(),
                "name", user.getFullName(),
                "role", user.getRole().name(),
                "provider", user.getAuthProvider().name()
        ));
    }
}
