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

    @Column(name = "question_content_snapshot", columnDefinition = "TEXT")
    private String questionContentSnapshot;

    @Column(name = "question_image_url_snapshot", length = 1000)
    private String questionImageUrlSnapshot;

    @Column(name = "question_difficulty_snapshot", length = 32)
    private String questionDifficultySnapshot;

    @Column(name = "question_type_snapshot", length = 32)
    private String questionTypeSnapshot;

    @Column(name = "answers_snapshot_json", columnDefinition = "json")
    private String answersSnapshotJson;
}
