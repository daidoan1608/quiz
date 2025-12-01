package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
@Table(name = "user_subject_permission", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "subject_id", "permission_type"})
})
public class UserSubjectPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // UUID của User
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // ID của Subject
    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    // Loại quyền: Ví dụ: "UPDATE", "DELETE", "CREATE_CHAPTER"
    @Column(name = "permission_type", nullable = false)
    private String permissionType;

}