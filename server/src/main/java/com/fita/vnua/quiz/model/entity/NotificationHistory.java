package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "notification_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    // Loại gửi: "GLOBAL", "SUBJECT_ID:10", "BATCH", "PERSONAL"
    @Column(name = "send_type")
    private String sendType;

    @Column(name = "created_by")
    private UUID createdBy; // ID Admin

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Khi xóa lịch sử -> Xóa sạch các thông báo con
    @OneToMany(mappedBy = "history", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}