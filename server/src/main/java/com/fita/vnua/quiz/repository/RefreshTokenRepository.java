package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(UUID token);

    Optional<RefreshToken> findByTokenAndRevoked(UUID token, boolean revoked);

    void deleteByToken(UUID token);
}
