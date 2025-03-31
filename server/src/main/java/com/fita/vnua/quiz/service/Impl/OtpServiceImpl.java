package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.OtpCodeDto;
import com.fita.vnua.quiz.model.entity.OtpCode;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.OtpCodeRepository;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.OtpService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

    // Gửi OTP
    @Transactional
    public String generateOtp(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user == null) return "Email không tồn tại.";

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
    public boolean verifyOtp(String email, String otp) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user == null) return false;

        UUID userId = user.get().getUserId();
        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByUser(user);
        if (otpCodeOpt.isEmpty()) return false;

        OtpCode otpCode = otpCodeOpt.get();
        if (!otpCode.getOtp().equals(otp) || otpCode.getOtpExpiry().isBefore(Instant.now())) {
            return false;
        }

        otpCodeRepository.deleteByUserId(userId); // Xóa OTP sau khi sử dụng

        return true;
    }
}

