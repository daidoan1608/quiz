package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.enums.NotificationType;

import com.fita.vnua.quiz.model.dto.response.NotificationResponse;
import com.fita.vnua.quiz.model.dto.response.RecipientResponse;
import com.fita.vnua.quiz.model.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("""
            SELECT new com.fita.vnua.quiz.model.dto.response.NotificationProjectionResponse(
                n.id,
                n.title,
                n.message,
                n.type,
                n.relatedId,
                n.relatedType,
                CASE
                    WHEN n.type = com.fita.vnua.quiz.model.enums.NotificationType.PERSONAL
                         AND n.isRead = true THEN 1L
                    WHEN n.type = com.fita.vnua.quiz.model.enums.NotificationType.GLOBAL
                         AND gnr.id IS NOT NULL THEN 1L
                    ELSE 0L
                END,
                n.createdAt
            )
            FROM Notification n
            LEFT JOIN GlobalNotificationRead gnr
                ON n.id = gnr.notificationId AND gnr.userId = :userId
            WHERE
                (n.type = com.fita.vnua.quiz.model.enums.NotificationType.PERSONAL AND n.userId = :userId)
                OR
                (n.type = com.fita.vnua.quiz.model.enums.NotificationType.GLOBAL)
            ORDER BY n.createdAt DESC
            """)
    List<NotificationResponse> findAllNotificationsForUser(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.type = com.fita.vnua.quiz.model.enums.NotificationType.PERSONAL")
    void markAllPersonalAsRead(@Param("userId") UUID userId);

    @Query("""
               SELECT new com.fita.vnua.quiz.model.dto.response.RecipientResponse(
                   u.userId,
                   u.fullName,
                   u.email,
                   n.isRead
               )
               FROM Notification n
               JOIN User u ON n.userId = u.userId
               WHERE n.history.id = :historyId
            """)
    Page<RecipientResponse> findRecipientsByHistoryId(@Param("historyId") Long historyId, Pageable pageable);

    @Query("SELECT n.id FROM Notification n WHERE n.type = com.fita.vnua.quiz.model.enums.NotificationType.GLOBAL")
    List<Long> findAllGlobalNotificationIds();

    @Query("""
            SELECT COUNT(n)
            FROM Notification n
            LEFT JOIN GlobalNotificationRead gnr
                ON n.id = gnr.notificationId AND gnr.userId = :userId
            WHERE
                (
                    n.type = com.fita.vnua.quiz.model.enums.NotificationType.PERSONAL
                    AND n.userId = :userId
                    AND n.isRead = false
                )
                OR
                (
                    n.type = com.fita.vnua.quiz.model.enums.NotificationType.GLOBAL
                    AND gnr.id IS NULL
                )
            """)
    long countUnreadForUser(@Param("userId") UUID userId);
}
