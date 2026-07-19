package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    private String categoryName;

    private String categoryDescription;

    @Column(nullable = false)
    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    private UUID deletedBy;

    private UUID deletedCascadeId;

    private String deleteOriginType;

    private Long deleteOriginId;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subject> subjects;

    @PrePersist
    private void prePersist() {
        if (deleted == null) {
            deleted = false;
        }
    }
}
