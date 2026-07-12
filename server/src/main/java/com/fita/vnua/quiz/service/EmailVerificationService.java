package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.entity.EmailVerificationToken;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.EmailVerificationTokenRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.email-verification.expiration-minutes:30}")
    private long expirationMinutes;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Transactional
    public void createAndSendVerification(User user) {
        EmailVerificationToken verificationToken = tokenRepository.findByUser(user)
                .orElseGet(EmailVerificationToken::new);
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(expirationMinutes));
        verificationToken.setUsed(false);
        tokenRepository.save(verificationToken);

        sendVerificationEmail(user, verificationToken.getToken());
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token xác thực không hợp lệ"));

        User user = verificationToken.getUser();
        if (verificationToken.isUsed() && user.isEmailVerified()) {
            return;
        }

        if (verificationToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token xác thực đã được sử dụng");
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token xác thực đã hết hạn");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
    }

    private void sendVerificationEmail(User user, String token) {
        String verifyUrl = frontendBaseUrl + "/verify-email?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        if (mailFrom != null && !mailFrom.isBlank()) {
            message.setFrom(mailFrom);
        }
        message.setSubject("Xác thực email tài khoản Quiz VNUA");
        message.setText("Xin chào " + user.getFullName() + ",\n\n"
                + "Vui lòng nhấn vào liên kết dưới đây để xác thực email tài khoản của bạn:\n"
                + verifyUrl + "\n\n"
                + "Liên kết có hiệu lực trong " + expirationMinutes + " phút.\n"
                + "Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.");

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Could not send verification email to {}", user.getEmail(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể gửi email xác thực. Vui lòng thử lại sau.");
        }
    }
}
