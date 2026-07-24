package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.entity.OtpCode;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.OtpCodeRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.security.OtpGenerator;
import com.fita.vnua.quiz.service.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

    // Gửi OTP
    @Transactional
    public ApiResponse<Void> generateOtp(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return ApiResponse.error("Gửi OTP thất bại", "Email không tồn tại.");
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

        return ApiResponse.success("Mã OTP đã được gửi đến email.", null);
    }


    // Xác minh OTP
    @Transactional
    public ApiResponse<String> verifyOtp(String email, String otp) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return ApiResponse.error("Xác thực OTP thất bại", "Email không tồn tại.");
        }

        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByUser(user.get());
        if (otpCodeOpt.isEmpty()) {
            return ApiResponse.error("Xác thực OTP thất bại", "Không tìm thấy mã OTP.");
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (otpCode.getOtpExpiry().isBefore(Instant.now())) {
            otpCodeRepository.deleteByUserId(user.get().getUserId());
            return ApiResponse.error("Xác thực OTP thất bại", "Mã OTP đã hết hạn.");
        }

        if (otpCode.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            otpCodeRepository.deleteByUserId(user.get().getUserId());
            return ApiResponse.error("Xác thực OTP thất bại", "Mã OTP đã bị khóa do nhập sai quá nhiều lần.");
        }

        if (!passwordEncoder.matches(otp, otpCode.getOtp())) {
            otpCode.setFailedAttempts(otpCode.getFailedAttempts() + 1);
            otpCodeRepository.save(otpCode);
            return ApiResponse.error("Xác thực OTP thất bại", "Mã OTP không chính xác.");
        }

        String resetToken = UUID.randomUUID().toString();
        otpCode.setResetToken(passwordEncoder.encode(resetToken));
        otpCode.setFailedAttempts(0);
        otpCode.setResetTokenExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        otpCodeRepository.save(otpCode);

        return ApiResponse.success("Xác thực OTP thành công", resetToken);
    }


    @Transactional
    public ApiResponse<Void> resetPassword(String resetToken, String newPassword) {
        if (!StringUtils.hasText(resetToken)) {
            return ApiResponse.error("Đặt lại mật khẩu thất bại", "Token không hợp lệ.");
        }

        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findActiveResetTokens(Instant.now()).stream()
                .filter(code -> code.getResetToken() != null && passwordEncoder.matches(resetToken, code.getResetToken()))
                .findFirst();
        if (otpCodeOpt.isEmpty()) {
            return ApiResponse.error("Đặt lại mật khẩu thất bại", "Token không hợp lệ.");
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (otpCode.getResetTokenExpiry() == null ||
                otpCode.getResetTokenExpiry().isBefore(Instant.now())) {
            otpCodeRepository.deleteByUserId(otpCode.getUser().getUserId());
            return ApiResponse.error("Đặt lại mật khẩu thất bại", "Token đã hết hạn.");
        }

        User user = otpCode.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xoá OTP + resetToken sau khi dùng
        otpCodeRepository.deleteByUserId(user.getUserId());

        return ApiResponse.success("Đặt lại mật khẩu thành công.", null);
    }

}
