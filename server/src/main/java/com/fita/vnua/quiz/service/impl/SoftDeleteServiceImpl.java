package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.contract.SoftDeletable;
import com.fita.vnua.quiz.model.entity.*;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.SoftDeleteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SoftDeleteServiceImpl implements SoftDeleteService {
    private final CategoryRepository categoryRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;

    @Transactional
    @Override
    public void deleteCategory(Long categoryId, UUID actorId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        markDeleted(category, actorId, cascadeId, "CATEGORY", categoryId);
        subjectRepository.findSubjectsByCategoryAndDeletedFalse(category)
                .forEach(subject -> deleteSubjectTree(subject, actorId, cascadeId, "CATEGORY", categoryId));
        categoryRepository.save(category);
    }

    @Transactional
    @Override
    public void deleteSubject(Long subjectId, UUID actorId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        deleteSubjectTree(subject, actorId, cascadeId, "SUBJECT", subjectId);
    }

    @Transactional
    @Override
    public void deleteChapter(Long chapterId, UUID actorId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        deleteChapterTree(chapter, actorId, cascadeId, "CHAPTER", chapterId);
    }

    @Transactional
    @Override
    public void deleteExam(Long examId, UUID actorId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy bài thi", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        markDeleted(exam, actorId, cascadeId, "EXAM", examId);
        examRepository.save(exam);
    }

    @Transactional
    @Override
    public void deleteQuestion(Long questionId, UUID actorId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND));
        UUID cascadeId = UUID.randomUUID();
        markDeleted(question, actorId, cascadeId, "QUESTION", questionId);
        questionRepository.save(question);
    }

    @Transactional
    @Override
    public void restoreCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
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
    @Override
    public void restoreSubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getCategory().getDeleted())) {
            throw new CustomApiException("Vui lòng khôi phục danh mục trước", HttpStatus.BAD_REQUEST);
        }
        restoreSubjectTree(subject, subject.getDeletedCascadeId());
    }

    @Transactional
    @Override
    public void restoreChapter(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(chapter.getSubject().getDeleted())) {
            throw new CustomApiException("Vui lòng khôi phục môn học trước", HttpStatus.BAD_REQUEST);
        }
        restoreChapterTree(chapter, chapter.getDeletedCascadeId());
    }

    @Transactional
    @Override
    public void restoreExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy bài thi", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(exam.getSubject().getDeleted())) {
            throw new CustomApiException("Vui lòng khôi phục môn học trước", HttpStatus.BAD_REQUEST);
        }
        clearDeleted(exam);
        examRepository.save(exam);
    }

    @Transactional
    @Override
    public void restoreQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(question.getChapter().getDeleted())) {
            throw new CustomApiException("Vui lòng khôi phục chương trước", HttpStatus.BAD_REQUEST);
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
        var exams = examRepository.findDeletedBySubjectIdAndCascadeId(subject.getSubjectId(), cascadeId);
        exams.forEach(this::clearDeleted);
        examRepository.saveAll(exams);
    }

    private void restoreChapterTree(Chapter chapter, UUID cascadeId) {
        clearDeleted(chapter);
        chapterRepository.save(chapter);
        if (cascadeId == null) return;
        var questions = questionRepository.findDeletedByChapterIdAndCascadeId(chapter.getChapterId(), cascadeId);
        questions.forEach(this::clearDeleted);
        questionRepository.saveAll(questions);
    }

    private void markDeleted(SoftDeletable entity, UUID actorId, UUID cascadeId, String originType, Long originId) {
        if (Boolean.TRUE.equals(entity.getDeleted())) return;
        actorId = actorId != null ? actorId : currentActorId();
        entity.setDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setDeletedBy(actorId);
        entity.setDeletedCascadeId(cascadeId);
        entity.setDeleteOriginType(originType);
        entity.setDeleteOriginId(originId);
    }

    private void clearDeleted(SoftDeletable entity) {
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
