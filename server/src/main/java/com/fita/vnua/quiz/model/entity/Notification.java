package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tiêu đề (VD: "Bảo trì hệ thống" hoặc "Bạn được 10 điểm")
    @Column(nullable = false)
    private String title;

    // Nội dung chi tiết
    @Column(columnDefinition = "TEXT")
    private String message;

    // Loại thông báo: GLOBAL hoặc PERSONAL
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    // --- Các trường dành cho PERSONAL (Fan-out) ---

    // ID người nhận (Nếu là GLOBAL thì để NULL)
    @Column(name = "user_id")
    private UUID userId;

    // Trạng thái đọc (Chỉ dùng cho PERSONAL, GLOBAL dùng bảng phụ)
    @Column(name = "is_read")
    private boolean isRead = false;

    // --- Các trường mở rộng (Optional) ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "history_id")
    private NotificationHistory history;

    // ID liên kết để click vào (VD: ID của Exam, ID của Post...)
    @Column(name = "related_id")
    private Long relatedId;

    // Loại đối tượng liên kết (VD: "EXAM", "POST", "SYSTEM")
    @Column(name = "related_type")
    private String relatedType;

    // Thời gian tạo
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Mặc định isRead là false nếu chưa set
        if (this.type == NotificationType.PERSONAL) {
            this.isRead = false;
        }
    }

    public enum NotificationType {
        GLOBAL,   // Thông báo chung (Bảo trì, Lễ tết...)
        PERSONAL  // Thông báo riêng (Điểm thi, Nhắc nhở, Đề thi môn học...)
    }
}