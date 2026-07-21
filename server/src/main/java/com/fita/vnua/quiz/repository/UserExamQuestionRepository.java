package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserExamQuestionRepository extends JpaRepository<UserExamQuestion, Long> {
    List<UserExamQuestion> findByUserExamUserExamIdOrderByPositionAsc(Long userExamId);

    boolean existsByUserExamUserExamId(Long userExamId);

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
