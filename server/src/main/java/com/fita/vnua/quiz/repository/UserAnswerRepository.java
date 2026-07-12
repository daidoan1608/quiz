package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    @Query("SELECT ua FROM UserAnswer ua WHERE ua.userExam.userExamId = :userExamId")
    List<UserAnswer> findUserAnswersByUserExamId(Long userExamId);

    @Query("SELECT ua FROM UserAnswer ua WHERE ua.userExam.userExamId = :userExamId AND ua.question.questionId = :questionId")
    java.util.Optional<UserAnswer> findByUserExamIdAndQuestionId(@Param("userExamId") Long userExamId, @Param("questionId") Long questionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserAnswer ua WHERE ua.userExam.userExamId = :userExamId AND ua.question.questionId = :questionId")
    void deleteByUserExamIdAndQuestionId(@Param("userExamId") Long userExamId, @Param("questionId") Long questionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserAnswer ua WHERE ua.userExam.exam.examId = :examId")
    void deleteByExamId(@Param("examId") Long examId);
}
