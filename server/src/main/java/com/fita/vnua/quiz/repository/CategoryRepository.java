package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByDeletedFalse();

    List<Category> findByDeletedTrue();

    long countByDeletedFalse();

    @Query("""
            SELECT c FROM Category c
            WHERE c.deleted = false
            AND (
                LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.categoryDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """)
    List<Category> searchActive(@Param("keyword") String keyword);
}
