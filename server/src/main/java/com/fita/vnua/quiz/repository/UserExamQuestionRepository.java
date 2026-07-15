package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserExamQuestionRepository extends JpaRepository<UserExamQuestion, Long> {
    List<UserExamQuestion> findByUserExamUserExamIdOrderByPositionAsc(Long userExamId);

    boolean existsByUserExamUserExamId(Long userExamId);
}
