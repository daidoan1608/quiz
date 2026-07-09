package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Answer> answers = new ArrayList<>();

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum QuestionType {
        SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_IN_THE_BLANK
    }
}

