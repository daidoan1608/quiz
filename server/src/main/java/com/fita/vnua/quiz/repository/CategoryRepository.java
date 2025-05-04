package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
