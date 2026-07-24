package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.EmailVerificationToken;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    @Query("""
            SELECT evt FROM EmailVerificationToken evt
            JOIN FETCH evt.user
            WHERE evt.token = :token
            """)
    Optional<EmailVerificationToken> findByToken(@Param("token") String token);

    Optional<EmailVerificationToken> findByUser(User user);

    void deleteByUser(User user);
}
