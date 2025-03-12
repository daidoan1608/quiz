package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Category;
import com.fita.vnua.quiz.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findSubjectsByCategory(Category category);
}
