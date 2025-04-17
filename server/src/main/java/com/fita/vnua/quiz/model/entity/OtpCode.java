package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.Optional;

@Entity
@Table(name = "otp_codes")
@Data
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user; // Liên kết với bảng users

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private Instant otpExpiry; // Thời gian hết hạn

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private Instant resetTokenExpiry;


}
