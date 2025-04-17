package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY) // Tối ưu hiệu suất với FetchType.LAZY
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Boolean isCorrect;

}
