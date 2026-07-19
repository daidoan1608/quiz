package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.AdminGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminGroupRepository extends JpaRepository<AdminGroup, Long> {
    Optional<AdminGroup> findByCode(String code);
}
