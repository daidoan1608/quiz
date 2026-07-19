package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long examId;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, unique = true)
    private String title;

    @Column
    private String description;

    @Column(nullable = false)
    private Integer duration;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDate createdTime;

    @Column(nullable = false)
    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    private UUID deletedBy;

    private UUID deletedCascadeId;

    private String deleteOriginType;

    private Long deleteOriginId;

    @OneToMany(mappedBy = "exam")
    private List<ExamQuestion> examQuestions;

    @PrePersist
    private void prePersist() {
        if (deleted == null) {
            deleted = false;
        }
    }
}

