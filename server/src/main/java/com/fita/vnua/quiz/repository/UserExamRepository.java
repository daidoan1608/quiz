package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface UserExamRepository extends JpaRepository<UserExam, Long> {

    @Query("SELECT ue FROM UserExam ue WHERE ue.user.userId = :userId")
    List<UserExam> findUserExamsByUserId(UUID userId);
}
