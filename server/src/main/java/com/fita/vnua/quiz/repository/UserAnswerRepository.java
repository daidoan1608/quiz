package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    @Query("SELECT ua FROM UserAnswer ua WHERE ua.userExam.userExamId = :userExamId")
    List<UserAnswer> findUserAnswersByUserExamId(Long userExamId);
}
