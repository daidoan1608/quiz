package com.fita.vnua.quiz.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subjectId;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Exam> exams = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
