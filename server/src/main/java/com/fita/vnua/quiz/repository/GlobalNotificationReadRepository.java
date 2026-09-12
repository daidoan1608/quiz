package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.GlobalNotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GlobalNotificationReadRepository extends JpaRepository<GlobalNotificationRead, Long> {
    boolean existsByUserIdAndNotificationId(UUID userId, Long notificationId);

    @Query("SELECT gnr.notificationId FROM GlobalNotificationRead gnr WHERE gnr.userId = :userId")
    List<Long> findAllReadNotificationIds(@Param("userId") UUID userId);
}
