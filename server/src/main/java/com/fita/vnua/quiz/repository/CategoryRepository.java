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
            WHERE (:deleted IS NULL OR c.deleted = :deleted)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.categoryDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(c.categoryId AS string) LIKE CONCAT('%', :keyword, '%')
            )
            """)
    List<Category> filterCategories(@Param("keyword") String keyword, @Param("deleted") Boolean deleted);

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
