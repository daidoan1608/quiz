package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chapterId;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private Integer chapterNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    private UUID deletedBy;

    private UUID deletedCascadeId;

    private String deleteOriginType;

    private Long deleteOriginId;

    @PrePersist
    private void prePersist() {
        if (deleted == null) {
            deleted = false;
        }
    }
}
