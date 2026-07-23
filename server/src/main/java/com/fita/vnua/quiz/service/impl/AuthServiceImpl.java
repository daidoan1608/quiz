package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.AuthProvider;

import com.fita.vnua.quiz.model.enums.UserRole;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.command.UserCommand;
import com.fita.vnua.quiz.model.dto.request.RegisterRequest;
import com.fita.vnua.quiz.model.dto.result.AuthRegistrationResult;
import com.fita.vnua.quiz.model.dto.response.AuthResponse;
import com.fita.vnua.quiz.model.entity.RefreshToken;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.RefreshTokenRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.CustomUserDetailsService;
import com.fita.vnua.quiz.security.JwtTokenUtil;
import com.fita.vnua.quiz.service.AdminCapabilityService;
import com.fita.vnua.quiz.service.AuthService;
import com.fita.vnua.quiz.service.EmailVerificationService;
import com.fita.vnua.quiz.service.GoogleIdTokenVerifierService;
import com.fita.vnua.quiz.service.UserService;
import com.fita.vnua.quiz.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserMapper userMapper;
    private final AdminCapabilityService adminCapabilityService;
    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final GoogleIdTokenVerifierService googleVerifier;
    private final CustomUserDetailsService customUserDetailsService;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    @Override
    public AuthResponse createAuthResponse(UserDetails userDetails) {
        User user = resolveUser(userDetails);
        AuthResponse response = userMapper.toAuthResponse(user);
        response.setCapabilities(adminCapabilityService.getCapabilities(user));
        return response;
    }

    @Override
    public String generateAccessToken(UserDetails userDetails) {
        return generateAccessTokenForUser(resolveUser(userDetails));
    }

    @Override
    @Transactional
    public String generateRefreshToken(UserDetails userDetails) {
        User user = resolveUser(userDetails);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID())
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken().toString();
    }

    @Override
    public String refreshAccessToken(UUID refreshTokenId) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevoked(refreshTokenId, false)
                .orElseThrow(() -> new CustomApiException("Phiên đăng nhập không tồn tại hoặc đã bị thu hồi", HttpStatus.UNAUTHORIZED));

        if (refreshToken.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(refreshToken);
            throw new CustomApiException("Phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        if (Boolean.TRUE.equals(user.getDeleted())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new CustomApiException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.", HttpStatus.FORBIDDEN);
        }
        return generateAccessTokenForUser(user);
    }

    @Override
    public void revokeRefreshToken(UUID tokenId) {
        refreshTokenRepository.findByTokenAndRevoked(tokenId, false)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }

    @Override
    @Transactional
    public AuthRegistrationResult register(RegisterRequest registerRequest) {
        User existingByEmail = userService.findEntityByEmail(registerRequest.getEmail());
        User existingByUsername = userService.findEntityByUsername(registerRequest.getUsername());

        if (existingByEmail != null && existingByEmail.isEmailVerified()) {
            throw new CustomApiException("EMAIL_ALREADY_EXISTS", "Email đã được sử dụng", HttpStatus.BAD_REQUEST);
        }
        if (existingByUsername != null && existingByUsername.isEmailVerified()) {
            throw new CustomApiException("USERNAME_ALREADY_EXISTS", "Tên đăng nhập đã được sử dụng", HttpStatus.BAD_REQUEST);
        }
        if (existingByEmail != null && existingByUsername != null
                && !existingByEmail.getUserId().equals(existingByUsername.getUserId())) {
            throw new CustomApiException(
                    "ACCOUNT_PENDING_VERIFICATION",
                    "Email hoặc tên đăng nhập đang chờ xác thực",
                    HttpStatus.BAD_REQUEST
            );
        }

        User pendingUser = existingByEmail != null ? existingByEmail : existingByUsername;
        if (pendingUser != null) {
            UserCommand pendingUserCommand = new UserCommand();
            pendingUserCommand.setUsername(registerRequest.getUsername());
            pendingUserCommand.setEmail(registerRequest.getEmail());
            pendingUserCommand.setFullName(registerRequest.getFullName());
            pendingUserCommand.setPassword(registerRequest.getPassword());
            UserCommand updatedPendingUser = userService.update(pendingUser.getUserId(), pendingUserCommand);
            emailVerificationService.createAndSendVerification(userService.findEntityById(updatedPendingUser.getUserId()));
            return new AuthRegistrationResult("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.", false);
        }

        UserCommand user = new UserCommand();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setRole(UserRole.USER);
        UserCommand createdUser = userService.create(user);
        emailVerificationService.createAndSendVerification(userService.findEntityById(createdUser.getUserId()));
        return new AuthRegistrationResult("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.", true);
    }

    @Override
    public UserDetails authenticateGoogleToken(String idToken) throws Exception {
        if (!googleVerifier.verify(idToken)) {
            throw new CustomApiException("INVALID_GOOGLE_TOKEN", "Google ID Token không hợp lệ", HttpStatus.UNAUTHORIZED);
        }

        String email = googleVerifier.extractEmail(idToken);
        String name = googleVerifier.extractName(idToken);
        String picture = googleVerifier.extractPicture(idToken);
        User user = findOrCreateGoogleUser(email, name, picture);
        return customUserDetailsService.loadUserByUsername(user.getUsername());
    }

    @Override
    @Transactional
    public User findOrCreateGoogleUser(String email, String name, String picture) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    if (Boolean.TRUE.equals(user.getDeleted())) {
                        throw new CustomApiException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.", HttpStatus.FORBIDDEN);
                    }
                    return syncGoogleProfile(user, name, picture);
                })
                .orElseGet(() -> createGoogleUser(email, name, picture));
    }

    private User getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new CustomApiException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.", HttpStatus.FORBIDDEN);
        }
        return user;
    }

    private User resolveUser(UserDetails userDetails) {
        if (userDetails instanceof User user) {
            if (Boolean.TRUE.equals(user.getDeleted())) {
                throw new CustomApiException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.", HttpStatus.FORBIDDEN);
            }
            return user;
        }
        return getUserByUsername(userDetails.getUsername());
    }

    private String generateAccessTokenForUser(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId().toString());
        claims.put("role", user.getRole().name());

        return jwtTokenUtil.generateToken(claims, user.getUsername());
    }

    private User createGoogleUser(String email, String name, String picture) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(generateUniqueGoogleUsername(email));
        user.setFullName(name);
        user.setRole(UserRole.USER);
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setEmailVerified(true);
        user.setPassword(null);
        user.setAvatarUrl(picture);
        return userRepository.save(user);
    }

    private User syncGoogleProfile(User user, String name, String picture) {
        boolean changed = false;
        if (user.getAuthProvider() != AuthProvider.GOOGLE) {
            user.setAuthProvider(AuthProvider.GOOGLE);
            changed = true;
        }
        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            changed = true;
        }
        if (name != null && !name.equals(user.getFullName())) {
            user.setFullName(name);
            changed = true;
        }
        if (picture != null && !picture.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(picture);
            changed = true;
        }
        return changed ? userRepository.save(user) : user;
    }

    private String generateUniqueGoogleUsername(String email) {
        String localPart = email.split("@", 2)[0].replaceAll("[^a-zA-Z0-9_]", "_");
        if (localPart.isBlank()) {
            localPart = "google_user";
        }

        String base = localPart.length() > 20 ? localPart.substring(0, 20) : localPart;
        String username = base;
        int suffix = 1;
        while (userRepository.existsUserByUsername(username)) {
            String suffixText = "_" + suffix++;
            int maxBaseLength = Math.max(1, 20 - suffixText.length());
            username = base.substring(0, Math.min(base.length(), maxBaseLength)) + suffixText;
        }
        return username;
    }
}
