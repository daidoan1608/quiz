package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "user_exam_question")
public class UserExamQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userExamQuestionId;

    @ManyToOne
    @JoinColumn(name = "user_exam_id", nullable = false)
    private UserExam userExam;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private Integer position;
}
