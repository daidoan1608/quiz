package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty; // Enum: EASY, MEDIUM, HARD

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type")
    private QuestionType questionType = QuestionType.SINGLE_CHOICE;

    @ManyToOne
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(nullable = false)
    private Boolean deleted = false;

    @Column(name = "exam_enabled", nullable = false)
    private Boolean examEnabled = true;

    @Column(name = "practice_enabled", nullable = false)
    private Boolean practiceEnabled = true;

    private LocalDateTime deletedAt;

    private UUID deletedBy;

    private UUID deletedCascadeId;

    private String deleteOriginType;

    private Long deleteOriginId;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Answer> answers = new ArrayList<>();

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum QuestionType {
        SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_IN_THE_BLANK
    }

    @PrePersist
    private void prePersist() {
        ensureDefaults();
    }

    @PreUpdate
    private void preUpdate() {
        ensureDefaults();
    }

    private void ensureDefaults() {
        if (deleted == null) {
            deleted = false;
        }
        if (examEnabled == null) {
            examEnabled = true;
        }
        if (practiceEnabled == null) {
            practiceEnabled = true;
        }
        if (questionType == null) {
            questionType = QuestionType.SINGLE_CHOICE;
        }
    }
}

