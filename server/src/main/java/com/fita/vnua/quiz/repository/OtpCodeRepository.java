package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.OtpCode;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findByUser(User user);
    Optional<OtpCode> findByResetToken(String resetToken);

    @Query("""
            SELECT o FROM OtpCode o
            JOIN FETCH o.user
            WHERE o.resetToken IS NOT NULL
            AND o.resetTokenExpiry > :now
            """)
    List<OtpCode> findActiveResetTokens(@Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.user.userId = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

}
