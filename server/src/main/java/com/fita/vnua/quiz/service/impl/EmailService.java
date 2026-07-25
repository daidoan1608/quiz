package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateService emailTemplateService;

    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            String html = emailTemplateService.render("otp.html", Map.of("otp", otp));

            helper.setTo(to);
            helper.setSubject("Mã OTP đặt lại mật khẩu");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new CustomApiException("Lỗi khi gửi email: " + e.getMessage(), e);
        }
    }
}
