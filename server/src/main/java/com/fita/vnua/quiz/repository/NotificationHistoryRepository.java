package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.NotificationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface NotificationHistoryRepository extends JpaRepository<NotificationHistory, Long> {
    @Query("SELECT h FROM NotificationHistory h WHERE :keyword IS NULL OR h.title LIKE %:keyword%")
    Page<NotificationHistory> searchByTitle(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
            SELECT h FROM NotificationHistory h
            WHERE (:keyword IS NULL OR :keyword = ''
                OR LOWER(h.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(h.message) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:sendType IS NULL OR :sendType = '' OR h.sendType = :sendType OR h.sendType LIKE CONCAT(:sendType, ':%'))
              AND (:createdBy IS NULL OR h.createdBy = :createdBy)
              AND (:fromDate IS NULL OR h.createdAt >= :fromDate)
              AND (:toDate IS NULL OR h.createdAt <= :toDate)
            """)
    Page<NotificationHistory> searchCampaigns(
            @Param("keyword") String keyword,
            @Param("sendType") String sendType,
            @Param("createdBy") UUID createdBy,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
