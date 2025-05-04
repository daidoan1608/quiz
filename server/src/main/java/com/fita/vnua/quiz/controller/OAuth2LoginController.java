//package com.fita.vnua.quiz.controller;
//
//import com.fita.vnua.quiz.model.dto.response.AuthResponse;
//import com.fita.vnua.quiz.model.entity.User;
//import com.fita.vnua.quiz.repository.UserRepository;
//import com.fita.vnua.quiz.security.JwtTokenUtil;
//import com.fita.vnua.quiz.service.AuthService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//
//@RequestMapping("/auth")
//@RequiredArgsConstructor
//public class OAuth2LoginController {
//    private final UserRepository userRepository;
//    private final OAuth2AuthorizedClientService authorizedClientService;
//    private final AuthService authService;
//
//
//    @PostMapping("/google")
//    public ResponseEntity<?> loginWithGoogle(OAuth2AuthenticationToken authentication) {
//        OAuth2User oAuth2User = authentication.getPrincipal();
//        String email = oAuth2User.getAttribute("email");
//        String username = oAuth2User.getAttribute("name");
//
//        // Kiểm tra người dùng đã tồn tại trong cơ sở dữ liệu chưa
//        User user = userRepository.findByEmail(email)
//                .orElseGet(() -> {
//                    // Tạo mới người dùng nếu chưa tồn tại
//                    User newUser = new User();
//                    newUser.setUsername(username);
//                    newUser.setEmail(email);
//                    newUser.setFullName(username);
//                    return userRepository.save(newUser);
//                });
//
//        // Tạo và trả về JWT tokens (access token và refresh token)
//        String accessToken = authService.generateAccessToken(user);
//        String refreshToken = authService.generateRefreshToken(user);
//
//        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user.getId()));
//    }
//
//    // Định nghĩa các phương thức xử lý đăng nhập với các nhà cung cấp khác (Facebook, GitHub)
//}
