package com.fita.vnua.quiz.model.entity;

import com.fita.vnua.quiz.genaretor.ExamQuestionId;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "exam_question")
public class ExamQuestion {
    @EmbeddedId
    private ExamQuestionId id;

    @ManyToOne
    @MapsId("examId") // Ánh xạ khóa ngoại "examId" trong ExamQuestionId
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @MapsId("questionId") // Ánh xạ khóa ngoại "questionId" trong ExamQuestionId
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}
