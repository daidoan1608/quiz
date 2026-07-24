package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserExamQuestionRepository extends JpaRepository<UserExamQuestion, Long> {
    List<UserExamQuestion> findByUserExamUserExamIdOrderByPositionAsc(Long userExamId);

    @Query("""
            SELECT DISTINCT ueq FROM UserExamQuestion ueq
            JOIN FETCH ueq.userExam ue
            JOIN FETCH ueq.question q
            LEFT JOIN FETCH q.answers
            JOIN FETCH q.chapter c
            JOIN FETCH c.subject
            WHERE ue.userExamId IN :userExamIds
            ORDER BY ue.userExamId, ueq.position
            """)
    List<UserExamQuestion> findWithQuestionDetailsByUserExamIds(@Param("userExamIds") List<Long> userExamIds);

    boolean existsByUserExamUserExamId(Long userExamId);

    boolean existsByUserExamUserExamIdAndQuestionQuestionId(Long userExamId, Long questionId);

    @Query("""
            SELECT CASE WHEN COUNT(ueq) > 0 THEN true ELSE false END
            FROM UserExamQuestion ueq
            WHERE ueq.question.questionId = :questionId
              AND ueq.userExam.status = 'SUBMITTED'
            """)
    boolean existsSubmittedSnapshotByQuestionId(@Param("questionId") Long questionId);

    @Query("""
            SELECT CASE WHEN COUNT(ueq) > 0 THEN true ELSE false END
            FROM UserExamQuestion ueq
            WHERE ueq.question.questionId = :questionId
              AND ueq.userExam.status IN :statuses
            """)
    boolean existsSnapshotByQuestionIdAndStatuses(
            @Param("questionId") Long questionId,
            @Param("statuses") List<String> statuses
    );
}
