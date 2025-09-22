package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.OtpCodeDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.model.entity.OtpCode;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.OtpCodeRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.formula.functions.T;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

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

        // Sinh OTP 6 chữ số
        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        // Tạo entity và lưu
        OtpCode otpCodeSaved = new OtpCode();
        otpCodeSaved.setOtp(otp);
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

        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByUser(user);
        if (otpCodeOpt.isEmpty()) {
            return ApiResponse.error("Xác thực OTP thất bại", "Không tìm thấy mã OTP.");
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (!otpCode.getOtp().equals(otp)) {
            return ApiResponse.error("Xác thực OTP thất bại", "Mã OTP không chính xác.");
        }

        if (otpCode.getOtpExpiry().isBefore(Instant.now())) {
            return ApiResponse.error("Xác thực OTP thất bại", "Mã OTP đã hết hạn.");
        }

        String resetToken = UUID.randomUUID().toString();
        otpCode.setResetToken(resetToken);
        otpCode.setResetTokenExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        otpCodeRepository.save(otpCode);

        return ApiResponse.success("OTP verified successfully", resetToken);
    }


    @Transactional
    public ApiResponse<Void> resetPassword(String resetToken, String newPassword) {
        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByResetToken(resetToken);
        if (otpCodeOpt.isEmpty()) {
            return ApiResponse.error("Đặt lại mật khẩu thất bại", "Token không hợp lệ.");
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (otpCode.getResetTokenExpiry() != null &&
                otpCode.getResetTokenExpiry().isBefore(Instant.now())) {
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

