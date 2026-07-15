package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.UserSubjectPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM UserSubjectPermission p WHERE p.userId = :userId AND p.subjectId = :subjectId")
    void deleteByUserIdAndSubjectId(@Param("userId") UUID userId, @Param("subjectId") Long subjectId);

    List<UserSubjectPermission> findAllByUserId(UUID userId);
}
