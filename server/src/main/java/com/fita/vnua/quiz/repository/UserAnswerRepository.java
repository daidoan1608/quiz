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

    @Query("""
            SELECT ua.question.questionId, ua.question.content, COUNT(ua)
            FROM UserAnswer ua
            WHERE ua.answer.isCorrect = false
            GROUP BY ua.question.questionId, ua.question.content
            ORDER BY COUNT(ua) DESC
            """)
    List<Object[]> findMostWrongQuestions();

    @Query("""
            SELECT ua FROM UserAnswer ua
            WHERE ua.userExam.user.userId = :userId
              AND ua.userExam.status = 'SUBMITTED'
              AND ua.question.chapter.chapterId = :chapterId
            """)
    List<UserAnswer> findSubmittedAnswersByUserAndChapter(
            @Param("userId") java.util.UUID userId,
            @Param("chapterId") Long chapterId);

    @Query("""
            SELECT ua FROM UserAnswer ua
            JOIN FETCH ua.question q
            JOIN FETCH q.chapter c
            JOIN FETCH c.subject s
            JOIN FETCH ua.answer
            JOIN FETCH ua.userExam ue
            WHERE ue.user.userId = :userId
              AND ue.status = 'SUBMITTED'
              AND q.deleted = false
              AND c.deleted = false
              AND s.deleted = false
              AND (:subjectId IS NULL OR s.subjectId = :subjectId)
              AND (:chapterId IS NULL OR c.chapterId = :chapterId)
            ORDER BY COALESCE(ue.endTime, ue.updatedAt, ue.startTime) DESC
            """)
    List<UserAnswer> findSubmittedAnswersByUserForPractice(
            @Param("userId") java.util.UUID userId,
            @Param("subjectId") Long subjectId,
            @Param("chapterId") Long chapterId);
}
