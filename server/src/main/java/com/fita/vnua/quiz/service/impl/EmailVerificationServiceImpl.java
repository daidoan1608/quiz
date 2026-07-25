package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.entity.EmailVerificationToken;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.EmailVerificationTokenRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final EmailTemplateService emailTemplateService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.email-verification.expiration-minutes:30}")
    private long expirationMinutes;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Transactional
    @Override
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
    @Override
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
        String html = emailTemplateService.render("verify-email.html", Map.of(
                "name", user.getFullName(),
                "verifyUrl", verifyUrl,
                "expirationMinutes", expirationMinutes
        ));

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom);
            }
            helper.setSubject("Xác thực email tài khoản Quiz VNUA");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException | MailException ex) {
            log.error("Could not send verification email to {}", user.getEmail(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể gửi email xác thực. Vui lòng thử lại sau.");
        }
    }
}
