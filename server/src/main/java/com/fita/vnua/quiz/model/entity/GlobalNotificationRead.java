package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "global_notification_read",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "notification_id"}))
// uniqueConstraints để đảm bảo 1 user không có 2 dòng "đã đọc" cho cùng 1 thông báo
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GlobalNotificationRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "notification_id", nullable = false)
    private Long notificationId;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        this.readAt = LocalDateTime.now();
    }
}