package com.fita.vnua.quiz.repository;

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

    /**
     * Lấy danh sách thông báo cho 1 User cụ thể.
     * Logic:
     * 1. Lấy thông báo PERSONAL gửi riêng cho User.
     * 2. HOẶC lấy thông báo GLOBAL toàn hệ thống.
     * 3. Tính toán cột isRead dựa trên việc JOIN với bảng global_notification_read.
     */
    @Query(value = """
            SELECT 
                n.id AS id,
                n.title AS title,
                n.message AS message,
                n.type AS type,
                n.related_id AS relatedId,
                n.related_type AS relatedType,
                n.created_at AS createdAt,
            
                -- FIX LỖI Ở ĐÂY: Ép kiểu về số nguyên (UNSIGNED) để Hibernate đọc được
                CAST(
                    CASE 
                        -- Nếu là tin cá nhân: Kiểm tra bit 1 (true)
                        WHEN n.type = 'PERSONAL' AND n.is_read = 1 THEN 1 
            
                        -- Nếu là tin Global: Check tồn tại trong bảng phụ
                        WHEN n.type = 'GLOBAL' AND gnr.id IS NOT NULL THEN 1 
            
                        -- Còn lại là chưa đọc (0)
                        ELSE 0 
                    END 
                AS UNSIGNED) AS isReadRaw
            
            FROM notifications n
            
            LEFT JOIN global_notification_read gnr 
                ON n.id = gnr.notification_id AND gnr.user_id = :userId
            
            WHERE 
                (n.type = 'PERSONAL' AND n.user_id = :userId)
                OR 
                (n.type = 'GLOBAL')
            
            ORDER BY n.created_at DESC
            """, nativeQuery = true)
    List<NotificationResponse> findAllNotificationsForUser(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.type = 'PERSONAL'")
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

    // 2. Lấy danh sách ID của tất cả thông báo Global
    @Query("SELECT n.id FROM Notification n WHERE n.type = 'GLOBAL'")
    List<Long> findAllGlobalNotificationIds();
}