package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.OtpCode;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.OtpCodeRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.OtpGenerator;
import com.fita.vnua.quiz.service.AuditLogService;
import com.fita.vnua.quiz.service.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final PasswordEncoder passwordEncoder;
    private final OtpGenerator otpGenerator;
    private final AuditLogService auditLogService;

    // Gửi OTP
    @Transactional
    public void generateOtp(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            auditLogService.recordSecurityEvent("OTP_SEND_FAILED", maskEmail(email), "Email không tồn tại");
            throw new CustomApiException("OTP_EMAIL_NOT_FOUND", "Email không tồn tại", HttpStatus.BAD_REQUEST);
        }

        UUID userId = user.get().getUserId();

        // Xoá OTP cũ nếu có
        otpCodeRepository.deleteByUserId(userId);

        // Sinh OTP 6 chữ số bằng SecureRandom qua abstraction để dễ test và bảo trì
        String otp = otpGenerator.generateNumericOtp(6);

        // Tạo entity và lưu OTP đã hash, không lưu OTP plain text trong DB
        OtpCode otpCodeSaved = new OtpCode();
        otpCodeSaved.setOtp(passwordEncoder.encode(otp));
        otpCodeSaved.setFailedAttempts(0);
        otpCodeSaved.setOtpExpiry(Instant.now().plus(5, ChronoUnit.MINUTES));
        otpCodeSaved.setUser(user.get());
        otpCodeRepository.save(otpCodeSaved);

        // Gửi email
        emailService.sendOtpEmail(email, otp);
        auditLogService.recordSecurityEvent("OTP_SENT", maskEmail(email), "Đã gửi OTP đặt lại mật khẩu");
    }


    // Xác minh OTP
    @Transactional
    public String verifyOtp(String email, String otp) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            auditLogService.recordSecurityEvent("OTP_VERIFY_FAILED", maskEmail(email), "Email không tồn tại");
            throw new CustomApiException("OTP_EMAIL_NOT_FOUND", "Email không tồn tại", HttpStatus.BAD_REQUEST);
        }

        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByUser(user.get());
        if (otpCodeOpt.isEmpty()) {
            auditLogService.recordSecurityEvent("OTP_VERIFY_FAILED", maskEmail(email), "Không tìm thấy mã OTP");
            throw new CustomApiException("OTP_NOT_FOUND", "Không tìm thấy mã OTP", HttpStatus.BAD_REQUEST);
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (otpCode.getOtpExpiry().isBefore(Instant.now())) {
            otpCodeRepository.deleteByUserId(user.get().getUserId());
            auditLogService.recordSecurityEvent("OTP_EXPIRED", maskEmail(email), "OTP đã hết hạn");
            throw new CustomApiException("OTP_EXPIRED", "Mã OTP đã hết hạn", HttpStatus.BAD_REQUEST);
        }

        if (otpCode.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            otpCodeRepository.deleteByUserId(user.get().getUserId());
            auditLogService.recordSecurityEvent("OTP_LOCKED", maskEmail(email), "OTP bị khóa do nhập sai quá nhiều lần");
            throw new CustomApiException("OTP_LOCKED", "Mã OTP đã bị khóa do nhập sai quá nhiều lần", HttpStatus.BAD_REQUEST);
        }

        if (!passwordEncoder.matches(otp, otpCode.getOtp())) {
            otpCode.setFailedAttempts(otpCode.getFailedAttempts() + 1);
            otpCodeRepository.save(otpCode);
            auditLogService.recordSecurityEvent("OTP_VERIFY_FAILED", maskEmail(email), "OTP không chính xác");
            throw new CustomApiException("INVALID_OTP", "Mã OTP không chính xác", HttpStatus.BAD_REQUEST);
        }

        String resetToken = UUID.randomUUID().toString();
        otpCode.setResetToken(passwordEncoder.encode(resetToken));
        otpCode.setFailedAttempts(0);
        otpCode.setResetTokenExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        otpCodeRepository.save(otpCode);
        auditLogService.recordSecurityEvent("OTP_VERIFIED", maskEmail(email), "Xác thực OTP thành công");

        return resetToken;
    }


    @Transactional
    public void resetPassword(String resetToken, String newPassword) {
        if (!StringUtils.hasText(resetToken)) {
            auditLogService.recordSecurityEvent("PASSWORD_RESET_FAILED", "reset-token", "Token không hợp lệ");
            throw new CustomApiException("INVALID_RESET_TOKEN", "Token không hợp lệ", HttpStatus.BAD_REQUEST);
        }

        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findActiveResetTokens(Instant.now()).stream()
                .filter(code -> code.getResetToken() != null && passwordEncoder.matches(resetToken, code.getResetToken()))
                .findFirst();
        if (otpCodeOpt.isEmpty()) {
            auditLogService.recordSecurityEvent("PASSWORD_RESET_FAILED", "reset-token", "Token không hợp lệ");
            throw new CustomApiException("INVALID_RESET_TOKEN", "Token không hợp lệ", HttpStatus.BAD_REQUEST);
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (otpCode.getResetTokenExpiry() == null ||
                otpCode.getResetTokenExpiry().isBefore(Instant.now())) {
            otpCodeRepository.deleteByUserId(otpCode.getUser().getUserId());
            auditLogService.recordSecurityEvent("PASSWORD_RESET_FAILED", maskEmail(otpCode.getUser().getEmail()), "Token đã hết hạn");
            throw new CustomApiException("RESET_TOKEN_EXPIRED", "Token đã hết hạn", HttpStatus.BAD_REQUEST);
        }

        User user = otpCode.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xoá OTP + resetToken sau khi dùng
        otpCodeRepository.deleteByUserId(user.getUserId());
        auditLogService.recordSecurityEvent("PASSWORD_RESET_SUCCESS", maskEmail(user.getEmail()), "Đặt lại mật khẩu thành công");
    }

    private String maskEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return "<blank>";
        }
        String trimmed = email.trim();
        int atIndex = trimmed.indexOf('@');
        if (atIndex <= 0) {
            return maskText(trimmed);
        }
        return maskText(trimmed.substring(0, atIndex)) + trimmed.substring(atIndex);
    }

    private String maskText(String value) {
        if (value.length() <= 2) {
            return "*".repeat(value.length());
        }
        return value.charAt(0) + "*".repeat(Math.min(value.length() - 2, 6)) + value.charAt(value.length() - 1);
    }

}
