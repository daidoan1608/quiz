package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.generator.FavoriteId;
import com.fita.vnua.quiz.model.entity.Favorite;
import com.fita.vnua.quiz.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    List<Favorite> findFavoriteByUser(User user);

    @Query("""
            SELECT f FROM Favorite f
            JOIN FETCH f.user
            JOIN FETCH f.subject s
            JOIN FETCH s.category
            WHERE f.user.userId = :userId
            """)
    List<Favorite> findByUserIdWithSubjectAndCategory(@Param("userId") UUID userId);

    Optional<Favorite> findByUserUserIdAndSubjectSubjectId(UUID userId, Long subjectId);

    /**
     * Lấy danh sách UUID của tất cả user đang yêu thích một môn học cụ thể.
     * Dùng để gửi thông báo hàng loạt (Fan-out).
     */
    @Query("SELECT f.user.userId FROM Favorite f WHERE f.subject.subjectId = :subjectId")
    List<UUID> findUserIdsBySubjectId(@Param("subjectId") Long subjectId);
}
