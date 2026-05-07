package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserSubjectPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface UserSubjectPermissionRepository extends JpaRepository<UserSubjectPermission, Long> {

    boolean existsByUserIdAndSubjectIdAndPermissionType(
            UUID userId,
            Long subjectId,
            String permissionType
    );

    @Modifying
    @Query("DELETE FROM UserSubjectPermission p WHERE p.userId = :userId")
    void deleteByUserId(UUID userId);

    @Transactional
    void deleteByUserIdAndSubjectId(UUID userId, Long subjectId);

    List<UserSubjectPermission> findAllByUserId(UUID userId);
}