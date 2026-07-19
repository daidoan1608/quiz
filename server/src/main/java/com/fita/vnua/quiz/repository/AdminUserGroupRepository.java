package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.AdminUserGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdminUserGroupRepository extends JpaRepository<AdminUserGroup, Long> {
    List<AdminUserGroup> findByUserIdAndGroupActiveTrue(UUID userId);

    List<AdminUserGroup> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);

    void deleteByUserIdAndGroupCode(UUID userId, String groupCode);
}
