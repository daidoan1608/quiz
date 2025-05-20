package com.fita.vnua.quiz.model.entity;

import com.fita.vnua.quiz.genaretor.FavoriteId;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Favorite {
    @EmbeddedId
    private FavoriteId id;

    @ManyToOne
    @MapsId("userId") // Ánh xạ khóa ngoại "examId" trong ExamQuestionId
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @MapsId("subjectId") // Ánh xạ khóa ngoại "questionId" trong ExamQuestionId
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
}
