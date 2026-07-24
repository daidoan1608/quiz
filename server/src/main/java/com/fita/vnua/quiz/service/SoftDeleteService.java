package com.fita.vnua.quiz.service;

import java.util.UUID;

public interface SoftDeleteService {
    void deleteCategory(Long categoryId, UUID actorId);

    void deleteSubject(Long subjectId, UUID actorId);

    void deleteChapter(Long chapterId, UUID actorId);

    void deleteExam(Long examId, UUID actorId);

    void deleteQuestion(Long questionId, UUID actorId);

    void restoreCategory(Long categoryId);

    void restoreSubject(Long subjectId);

    void restoreChapter(Long chapterId);

    void restoreExam(Long examId);

    void restoreQuestion(Long questionId);
}
