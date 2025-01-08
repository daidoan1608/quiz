package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.genaretor.ExamQuestionId;
import com.fita.vnua.quiz.model.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Map;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, ExamQuestionId> {
}
