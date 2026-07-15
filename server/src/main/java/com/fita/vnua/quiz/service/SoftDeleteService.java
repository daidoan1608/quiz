package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SoftDeleteService {
    private final CategoryRepository categoryRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;

    @Transactional
    public void deleteCategory(Long categoryId, UUID actorId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomApiException("Category not found", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        markDeleted(category, actorId, cascadeId, "CATEGORY", categoryId);
        subjectRepository.findSubjectsByCategoryAndDeletedFalse(category)
                .forEach(subject -> deleteSubjectTree(subject, actorId, cascadeId, "CATEGORY", categoryId));
        categoryRepository.save(category);
    }

    @Transactional
    public void deleteSubject(Long subjectId, UUID actorId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        deleteSubjectTree(subject, actorId, cascadeId, "SUBJECT", subjectId);
    }

    @Transactional
    public void deleteChapter(Long chapterId, UUID actorId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        deleteChapterTree(chapter, actorId, cascadeId, "CHAPTER", chapterId);
    }

    @Transactional
    public void deleteExam(Long examId, UUID actorId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomApiException("Exam not found", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        markDeleted(exam, actorId, cascadeId, "EXAM", examId);
        examRepository.save(exam);
    }

    @Transactional
    public void deleteQuestion(Long questionId, UUID actorId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        markDeleted(question, actorId, cascadeId, "QUESTION", questionId);
        questionRepository.save(question);
    }

    @Transactional
    public void restoreCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomApiException("Category not found", HttpStatus.NOT_FOUND));
        UUID cascadeId = category.getDeletedCascadeId();
        clearDeleted(category);
        categoryRepository.save(category);
        if (cascadeId == null) return;
        subjectRepository.findSubjectsByCategoryAndDeletedTrue(category).forEach(subject -> {
            if (cascadeId.equals(subject.getDeletedCascadeId())) {
                restoreSubjectTree(subject, cascadeId);
            }
        });
    }

    @Transactional
    public void restoreSubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getCategory().getDeleted())) {
            throw new CustomApiException("Category must be restored first", HttpStatus.BAD_REQUEST);
        }
        restoreSubjectTree(subject, subject.getDeletedCascadeId());
    }

    @Transactional
    public void restoreChapter(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(chapter.getSubject().getDeleted())) {
            throw new CustomApiException("Subject must be restored first", HttpStatus.BAD_REQUEST);
        }
        restoreChapterTree(chapter, chapter.getDeletedCascadeId());
    }

    @Transactional
    public void restoreExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomApiException("Exam not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(exam.getSubject().getDeleted())) {
            throw new CustomApiException("Subject must be restored first", HttpStatus.BAD_REQUEST);
        }
        clearDeleted(exam);
        examRepository.save(exam);
    }

    @Transactional
    public void restoreQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Question not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(question.getChapter().getDeleted())) {
            throw new CustomApiException("Chapter must be restored first", HttpStatus.BAD_REQUEST);
        }
        clearDeleted(question);
        questionRepository.save(question);
    }

    private void deleteSubjectTree(Subject subject, UUID actorId, UUID cascadeId, String originType, Long originId) {
        markDeleted(subject, actorId, cascadeId, originType, originId);
        chapterRepository.findBySubject(subject.getSubjectId())
                .forEach(chapter -> deleteChapterTree(chapter, actorId, cascadeId, originType, originId));
        examRepository.findExamsBySubjectId(subject.getSubjectId())
                .forEach(exam -> {
                    markDeleted(exam, actorId, cascadeId, originType, originId);
                    examRepository.save(exam);
                });
        subjectRepository.save(subject);
    }

    private void deleteChapterTree(Chapter chapter, UUID actorId, UUID cascadeId, String originType, Long originId) {
        markDeleted(chapter, actorId, cascadeId, originType, originId);
        questionRepository.findByChapter(chapter.getChapterId()).forEach(question -> {
            markDeleted(question, actorId, cascadeId, originType, originId);
            questionRepository.save(question);
        });
        chapterRepository.save(chapter);
    }

    private void restoreSubjectTree(Subject subject, UUID cascadeId) {
        clearDeleted(subject);
        subjectRepository.save(subject);
        if (cascadeId == null) return;
        chapterRepository.findBySubjectIncludingDeleted(subject.getSubjectId()).forEach(chapter -> {
            if (cascadeId.equals(chapter.getDeletedCascadeId())) {
                restoreChapterTree(chapter, cascadeId);
            }
        });
        examRepository.findByDeletedTrue().forEach(exam -> {
            if (exam.getSubject().getSubjectId().equals(subject.getSubjectId())
                    && cascadeId.equals(exam.getDeletedCascadeId())) {
                clearDeleted(exam);
                examRepository.save(exam);
            }
        });
    }

    private void restoreChapterTree(Chapter chapter, UUID cascadeId) {
        clearDeleted(chapter);
        chapterRepository.save(chapter);
        if (cascadeId == null) return;
        questionRepository.findByDeletedTrue().forEach(question -> {
            if (question.getChapter().getChapterId().equals(chapter.getChapterId())
                    && cascadeId.equals(question.getDeletedCascadeId())) {
                clearDeleted(question);
                questionRepository.save(question);
            }
        });
    }

    private void markDeleted(Category entity, UUID actorId, UUID cascadeId, String originType, Long originId) {
        if (Boolean.TRUE.equals(entity.getDeleted())) return;
        actorId = actorId != null ? actorId : currentActorId();
        entity.setDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setDeletedBy(actorId);
        entity.setDeletedCascadeId(cascadeId);
        entity.setDeleteOriginType(originType);
        entity.setDeleteOriginId(originId);
    }

    private void markDeleted(Subject entity, UUID actorId, UUID cascadeId, String originType, Long originId) {
        if (Boolean.TRUE.equals(entity.getDeleted())) return;
        actorId = actorId != null ? actorId : currentActorId();
        entity.setDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setDeletedBy(actorId);
        entity.setDeletedCascadeId(cascadeId);
        entity.setDeleteOriginType(originType);
        entity.setDeleteOriginId(originId);
    }

    private void markDeleted(Chapter entity, UUID actorId, UUID cascadeId, String originType, Long originId) {
        if (Boolean.TRUE.equals(entity.getDeleted())) return;
        actorId = actorId != null ? actorId : currentActorId();
        entity.setDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setDeletedBy(actorId);
        entity.setDeletedCascadeId(cascadeId);
        entity.setDeleteOriginType(originType);
        entity.setDeleteOriginId(originId);
    }

    private void markDeleted(Exam entity, UUID actorId, UUID cascadeId, String originType, Long originId) {
        if (Boolean.TRUE.equals(entity.getDeleted())) return;
        actorId = actorId != null ? actorId : currentActorId();
        entity.setDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setDeletedBy(actorId);
        entity.setDeletedCascadeId(cascadeId);
        entity.setDeleteOriginType(originType);
        entity.setDeleteOriginId(originId);
    }

    private void markDeleted(Question entity, UUID actorId, UUID cascadeId, String originType, Long originId) {
        if (Boolean.TRUE.equals(entity.getDeleted())) return;
        actorId = actorId != null ? actorId : currentActorId();
        entity.setDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setDeletedBy(actorId);
        entity.setDeletedCascadeId(cascadeId);
        entity.setDeleteOriginType(originType);
        entity.setDeleteOriginId(originId);
    }

    private void clearDeleted(Category entity) {
        entity.setDeleted(false);
        entity.setDeletedAt(null);
        entity.setDeletedBy(null);
        entity.setDeletedCascadeId(null);
        entity.setDeleteOriginType(null);
        entity.setDeleteOriginId(null);
    }

    private void clearDeleted(Subject entity) {
        entity.setDeleted(false);
        entity.setDeletedAt(null);
        entity.setDeletedBy(null);
        entity.setDeletedCascadeId(null);
        entity.setDeleteOriginType(null);
        entity.setDeleteOriginId(null);
    }

    private void clearDeleted(Chapter entity) {
        entity.setDeleted(false);
        entity.setDeletedAt(null);
        entity.setDeletedBy(null);
        entity.setDeletedCascadeId(null);
        entity.setDeleteOriginType(null);
        entity.setDeleteOriginId(null);
    }

    private void clearDeleted(Exam entity) {
        entity.setDeleted(false);
        entity.setDeletedAt(null);
        entity.setDeletedBy(null);
        entity.setDeletedCascadeId(null);
        entity.setDeleteOriginType(null);
        entity.setDeleteOriginId(null);
    }

    private void clearDeleted(Question entity) {
        entity.setDeleted(false);
        entity.setDeletedAt(null);
        entity.setDeletedBy(null);
        entity.setDeletedCascadeId(null);
        entity.setDeleteOriginType(null);
        entity.setDeleteOriginId(null);
    }

    private UUID currentActorId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getUserId();
        }
        return null;
    }
}
