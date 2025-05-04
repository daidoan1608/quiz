package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.OtpCodeDto;
import com.fita.vnua.quiz.model.entity.OtpCode;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.OtpCodeRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
    public String generateOtp(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) return "Email không tồn tại.";

        UUID userId = user.get().getUserId();

        otpCodeRepository.deleteByUserId(userId); // Xóa OTP cũ nếu có

        String otp = String.format("%06d", new Random().nextInt(1000000));

        OtpCodeDto otpCode = new OtpCodeDto();
        otpCode.setOtp(otp);
        otpCode.setOtpExpiry(Instant.now().plus(5, ChronoUnit.MINUTES));
        otpCode.setUserId(userId);

        OtpCode otpCodeSaved = new OtpCode();
        otpCodeSaved.setOtp(otp);
        otpCodeSaved.setOtpExpiry(otpCode.getOtpExpiry());
        otpCodeSaved.setUser(user.get());
        otpCodeRepository.save(otpCodeSaved);

        emailService.sendOtpEmail(email, otp);

        return "Mã OTP đã được gửi đến email.";
    }

    // Xác minh OTP
    @Transactional
    public String verifyOtp(String email, String otp) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) return "Email không tồn tại.";

        UUID userId = user.get().getUserId();
        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByUser(user);
        if (otpCodeOpt.isEmpty()) return "Không tìm thấy mã OTP.";

        OtpCode otpCode = otpCodeOpt.get();

        if (!otpCode.getOtp().equals(otp))
            return "Mã OTP không chính xác.";

        if (otpCode.getOtpExpiry().isBefore(Instant.now()))
            return "Mã OTP đã hết hạn.";

        String resetToken = UUID.randomUUID().toString();
        otpCode.setResetToken(resetToken);
        otpCode.setResetTokenExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        otpCodeRepository.save(otpCode);

        return resetToken;
    }

    @Transactional
    public String resetPassword(String resetToken, String newPassword) {
        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByResetToken(resetToken);
        if (otpCodeOpt.isEmpty()) return "Token không hợp lệ.";

        OtpCode otpCode = otpCodeOpt.get();
        if (otpCode.getResetTokenExpiry() != null &&
                otpCode.getResetTokenExpiry().isBefore(Instant.now())) {
            return "Token đã hết hạn.";
        }

        User user = otpCode.getUser();
        user.setPassword(passwordEncoder.encode(newPassword)); // Đảm bảo đã inject `PasswordEncoder`
        userRepository.save(user);

        otpCodeRepository.deleteByUserId(user.getUserId()); // Xoá token sau khi dùng

        return "Đặt lại mật khẩu thành công.";
    }
}

