package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
}
