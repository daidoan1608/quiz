package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.AdminUserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AdminUserGroupRepository extends JpaRepository<AdminUserGroup, Long> {
    @Query("""
            SELECT aug FROM AdminUserGroup aug
            JOIN FETCH aug.group
            WHERE aug.userId = :userId
            AND aug.group.active = true
            """)
    List<AdminUserGroup> findByUserIdAndGroupActiveTrue(@Param("userId") UUID userId);

    @Query("""
            SELECT aug FROM AdminUserGroup aug
            JOIN FETCH aug.group
            WHERE aug.userId = :userId
            """)
    List<AdminUserGroup> findByUserId(@Param("userId") UUID userId);

    void deleteByUserId(UUID userId);

    void deleteByUserIdAndGroupCode(UUID userId, String groupCode);
}
