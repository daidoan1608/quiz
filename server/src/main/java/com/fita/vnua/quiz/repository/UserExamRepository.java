package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.entity.UserExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserExamRepository extends JpaRepository<UserExam, Long> {

    @Query("SELECT ue FROM UserExam ue WHERE ue.user.userId = :userId")
    List<UserExam> findUserExamsByUserId(UUID userId);

    @Query("SELECT ue.exam.examId AS examId, COUNT(ue) AS attempts " +
            "FROM UserExam ue " +
            "WHERE ue.user.userId = :userId " +
            "GROUP BY ue.exam.examId")
    List<Map<Long, Object>> countExamsByUserId(@Param("userId") UUID userId);

    @Query(value = """
        SELECT 
            u.user_id as userId,
            u.username as username,
            COUNT(ue.user_exam_id) as attemptCount,
            AVG(ue.score) as avgScore,
            SUM(ue.score) as totalScore,
            SUM(TIMESTAMPDIFF(SECOND, ue.start_time, ue.end_time)) as totalDurationSeconds,
            GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as subjects
        FROM user_exam ue
        JOIN user u ON ue.user_id = u.user_id
        JOIN exam e ON ue.exam_id = e.exam_id
        JOIN subject s ON e.subject_id = s.subject_id
        GROUP BY u.user_id, u.username
        """, nativeQuery = true)
    List<UserExamSummaryProjection> getUserExamSummaries();

    public interface UserExamSummaryProjection {
        byte[] getUserId();
        String getUsername();
        Long getAttemptCount();
        Double getAvgScore();
        Double getTotalScore();
        Long getTotalDurationSeconds();
        String getSubjects();
    }
}
