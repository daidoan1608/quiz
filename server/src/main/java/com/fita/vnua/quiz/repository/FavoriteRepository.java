package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.genaretor.FavoriteId;
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

    Optional<Favorite> findByUserUserIdAndSubjectSubjectId(UUID userId, Long subjectId);

    /**
     * Lấy danh sách UUID của tất cả user đang yêu thích một môn học cụ thể.
     * Dùng để gửi thông báo hàng loạt (Fan-out).
     */
    @Query("SELECT f.user.userId FROM Favorite f WHERE f.subject.subjectId = :subjectId")
    List<UUID> findUserIdsBySubjectId(@Param("subjectId") Long subjectId);
}
