package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.AdminGroup;
import com.fita.vnua.quiz.model.entity.AdminGroupPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface AdminGroupPermissionRepository extends JpaRepository<AdminGroupPermission, Long> {
    void deleteByGroup(AdminGroup group);

    List<AdminGroupPermission> findByGroup(AdminGroup group);

    List<AdminGroupPermission> findByGroupIdInAndGroupActiveTrue(Collection<Long> groupIds);
}
