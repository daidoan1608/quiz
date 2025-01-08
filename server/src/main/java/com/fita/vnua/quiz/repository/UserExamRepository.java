package com.fita.vnua.quiz.repository;

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
}
