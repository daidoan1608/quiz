package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.SharedDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SharedDocumentRepository extends JpaRepository<SharedDocument, Long> {
    List<SharedDocument> findByActiveTrueOrderByCreatedAtDesc();

    List<SharedDocument> findAllByOrderByCreatedAtDesc();
}
