package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.OtpCode;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findByUser(Optional<User> user);
    Optional<OtpCode> findByResetToken(String resetToken);
    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.user.userId = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

}

