package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.NotificationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationHistoryRepository extends JpaRepository<NotificationHistory, Long> {
    @Query("SELECT h FROM NotificationHistory h WHERE :keyword IS NULL OR h.title LIKE %:keyword%")
    Page<NotificationHistory> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
}