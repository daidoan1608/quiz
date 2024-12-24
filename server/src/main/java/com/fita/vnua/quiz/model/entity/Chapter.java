package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

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
}
