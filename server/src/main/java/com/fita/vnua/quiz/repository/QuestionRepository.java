package com.fita.vnua.quiz.repository;

import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    List<Question> findByDeletedFalse();

    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    List<Question> findByDeletedTrue();

    long countByDeletedFalse();

    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    Optional<Question> findByQuestionIdAndDeletedFalse(Long questionId);

    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    List<Question> findByContentContainingIgnoreCaseAndDeletedFalse(String content);

    default List<Question> findByContentContainingIgnoreCase(String content) {
        return findByContentContainingIgnoreCaseAndDeletedFalse(content);
    }

    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    @Query("SELECT q FROM Question q WHERE q.chapter.chapterId = :chapterId AND q.deleted = false")
    List<Question> findByChapter(@Param("chapterId") Long chapterId);

    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    @Query("SELECT q FROM Question q WHERE q.chapter.chapterId = :chapterId AND q.deleted = false AND q.practiceEnabled = true")
    List<Question> findPracticeByChapter(@Param("chapterId") Long chapterId);

    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    @Query("SELECT q FROM Question q JOIN q.chapter c JOIN c.subject s WHERE s.subjectId = :subjectId AND q.deleted = false")
    List<Question> findQuestionsBySubjectId(@Param("subjectId") Long subjectId);

    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.subject_id = :subjectId " +
            "AND q.deleted = false " +
            "AND q.exam_enabled = true " +
            "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
            "ORDER BY RAND() " +
            "LIMIT :number", nativeQuery = true)
    List<Question> findQuestionsBySubjectAndDifficulty(
            @Param("subjectId") Long subjectId,
            @Param("difficulty") String difficulty,
            @Param("number") int number);

    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.chapter_id = :chapterId " +
            "AND q.deleted = false " +
            "AND q.exam_enabled = true " +
            "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
            "ORDER BY RAND() " +
            "LIMIT :number", nativeQuery = true)
    List<Question> findQuestionsByChapterAndDifficulty(
            @Param("chapterId") Long chapterId,
            @Param("difficulty") String difficulty,
            @Param("number") int number);

    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.chapter_id = :chapterId " +
            "AND q.deleted = false " +
            "AND q.practice_enabled = true " +
            "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
            "ORDER BY RAND() " +
            "LIMIT :number", nativeQuery = true)
    List<Question> findPracticeQuestionsByChapterAndDifficulty(
            @Param("chapterId") Long chapterId,
            @Param("difficulty") String difficulty,
            @Param("number") int number);

    default List<Question> findQuestionsByChapter(Long chapterId, int number) {
        return findQuestionsByChapterAndDifficulty(chapterId, null, number);
    }

    // Lấy ngẫu nhiên số lượng câu hỏi theo subjectId
    @Query(value = "SELECT q.* FROM question q " +
            "JOIN chapter c ON q.chapter_id = c.chapter_id " +
            "WHERE c.subject_id = :subjectId " +
            "AND q.deleted = false " +
            "AND q.exam_enabled = true " +
            "ORDER BY RAND() LIMIT :number", nativeQuery = true)
    List<Question> findRandomQuestionsBySubject(
            @Param("subjectId") Long subjectId,
            @Param("number") int number);

    @Query("""
            SELECT DISTINCT q FROM ExamQuestion eq
            JOIN eq.question q
            LEFT JOIN FETCH q.answers
            JOIN FETCH q.chapter c
            JOIN FETCH c.subject
            WHERE eq.exam.examId = :examId
            AND q.deleted = false
            """)
    List<Question> findQuestionsByExamId(Long examId);

    @Query("""
            SELECT DISTINCT q FROM ExamQuestion eq
            JOIN eq.question q
            LEFT JOIN FETCH q.answers
            JOIN FETCH q.chapter c
            JOIN FETCH c.subject
            WHERE eq.exam.examId = :examId
            """)
    List<Question> findQuestionsByExamIdIncludingDeleted(Long examId);

    long countByDifficultyAndDeletedFalse(Question.Difficulty difficulty);

    default long countByDifficulty(Question.Difficulty difficulty) {
        return countByDifficultyAndDeletedFalse(difficulty);
    }

    @Query("SELECT q.chapter.subject.subjectId FROM Question q WHERE q.questionId = :questionId")
    Optional<Long> findSubjectIdByQuestionId(@Param("questionId") Long questionId);

    @Query("""
            SELECT q.chapter.subject.subjectId FROM Question q
            WHERE q.questionId = :questionId
            AND q.deleted = false
            AND q.chapter.deleted = false
            AND q.chapter.subject.deleted = false
            """)
    Optional<Long> findActiveSubjectIdByQuestionId(@Param("questionId") Long questionId);

    int countByChapterAndDeletedFalse(Chapter chapter);

    @Query("""
            SELECT q.chapter.chapterId, COUNT(q)
            FROM Question q
            WHERE q.chapter.chapterId IN :chapterIds
            AND q.deleted = false
            AND q.examEnabled = true
            GROUP BY q.chapter.chapterId
            """)
    List<Object[]> countActiveQuestionsByChapterIds(@Param("chapterIds") List<Long> chapterIds);

    @Query("""
            SELECT q.chapter.subject.subjectId, COUNT(q)
            FROM Question q
            WHERE q.chapter.subject.subjectId IN :subjectIds
            AND q.deleted = false
            AND q.examEnabled = true
            GROUP BY q.chapter.subject.subjectId
            """)
    List<Object[]> countActiveQuestionsBySubjectIds(@Param("subjectIds") List<Long> subjectIds);

    default int countByChapter(Chapter chapter) {
        return countByChapterAndDeletedFalse(chapter);
    }

    long countByChapterAndDifficultyAndDeletedFalse(Chapter chapter, Question.Difficulty difficulty);

    default long countByChapterAndDifficulty(Chapter chapter, Question.Difficulty difficulty) {
        return countByChapterAndDifficultyAndDeletedFalse(chapter, difficulty);
    }

    @Query("SELECT q.chapter.chapterId, q.difficulty, COUNT(q) " +
           "FROM Question q " +
           "WHERE q.chapter.subject.subjectId = :subjectId " +
           "AND q.deleted = false " +
           "AND q.examEnabled = true " +
           "GROUP BY q.chapter.chapterId, q.difficulty")
    List<Object[]> countQuestionsBySubjectGroupedByChapterAndDifficulty(@Param("subjectId") Long subjectId);

    @EntityGraph(attributePaths = {"answers", "chapter", "chapter.subject"})
    @Query("""
            SELECT q FROM Question q
            WHERE (:keyword IS NULL OR LOWER(q.content) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:subjectId IS NULL OR q.chapter.subject.subjectId = :subjectId)
              AND (:chapterId IS NULL OR q.chapter.chapterId = :chapterId)
              AND (:difficulty IS NULL OR q.difficulty = :difficulty)
              AND (:deleted IS NULL OR q.deleted = :deleted)
              AND (:examEnabled IS NULL OR q.examEnabled = :examEnabled)
              AND (:practiceEnabled IS NULL OR q.practiceEnabled = :practiceEnabled)
            ORDER BY q.questionId DESC
            """)
    List<Question> filterQuestions(
            @Param("keyword") String keyword,
            @Param("subjectId") Long subjectId,
            @Param("chapterId") Long chapterId,
            @Param("difficulty") Question.Difficulty difficulty,
            @Param("deleted") Boolean deleted,
            @Param("examEnabled") Boolean examEnabled,
            @Param("practiceEnabled") Boolean practiceEnabled);

    @Query(
            value = """
            SELECT q.questionId FROM Question q
            JOIN q.chapter c
            JOIN c.subject s
            WHERE (:keyword IS NULL OR LOWER(q.content) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:subjectId IS NULL OR s.subjectId = :subjectId)
              AND (:chapterId IS NULL OR c.chapterId = :chapterId)
              AND (:difficulty IS NULL OR q.difficulty = :difficulty)
              AND (:deleted IS NULL OR q.deleted = :deleted)
              AND (:examEnabled IS NULL OR q.examEnabled = :examEnabled)
              AND (:practiceEnabled IS NULL OR q.practiceEnabled = :practiceEnabled)
              AND (:creatorFilterEnabled = false OR q.questionId IN :creatorQuestionIds)
              AND (:excludeExamId IS NULL OR NOT EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
                    AND eq.exam.examId = :excludeExamId
              ))
              AND (:usageFilter <> 'unused' OR NOT EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
              ))
              AND (:usageFilter <> 'used' OR EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
              ))
              AND (:excludeUsedInSubject = false OR NOT EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
                    AND eq.exam.subject.subjectId = :subjectId
              ))
            """,
            countQuery = """
            SELECT COUNT(q) FROM Question q
            JOIN q.chapter c
            JOIN c.subject s
            WHERE (:keyword IS NULL OR LOWER(q.content) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:subjectId IS NULL OR s.subjectId = :subjectId)
              AND (:chapterId IS NULL OR c.chapterId = :chapterId)
              AND (:difficulty IS NULL OR q.difficulty = :difficulty)
              AND (:deleted IS NULL OR q.deleted = :deleted)
              AND (:examEnabled IS NULL OR q.examEnabled = :examEnabled)
              AND (:practiceEnabled IS NULL OR q.practiceEnabled = :practiceEnabled)
              AND (:creatorFilterEnabled = false OR q.questionId IN :creatorQuestionIds)
              AND (:excludeExamId IS NULL OR NOT EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
                    AND eq.exam.examId = :excludeExamId
              ))
              AND (:usageFilter <> 'unused' OR NOT EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
              ))
              AND (:usageFilter <> 'used' OR EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
              ))
              AND (:excludeUsedInSubject = false OR NOT EXISTS (
                  SELECT eq FROM ExamQuestion eq
                  WHERE eq.question.questionId = q.questionId
                    AND eq.exam.subject.subjectId = :subjectId
              ))
            """
    )
    Page<Long> filterQuestionIds(
            @Param("keyword") String keyword,
            @Param("subjectId") Long subjectId,
            @Param("chapterId") Long chapterId,
            @Param("difficulty") Question.Difficulty difficulty,
            @Param("deleted") Boolean deleted,
            @Param("examEnabled") Boolean examEnabled,
            @Param("practiceEnabled") Boolean practiceEnabled,
            @Param("creatorFilterEnabled") boolean creatorFilterEnabled,
            @Param("creatorQuestionIds") List<Long> creatorQuestionIds,
            @Param("usageFilter") String usageFilter,
            @Param("excludeExamId") Long excludeExamId,
            @Param("excludeUsedInSubject") boolean excludeUsedInSubject,
            Pageable pageable
    );

    @Query("""
            SELECT DISTINCT q FROM Question q
            LEFT JOIN FETCH q.answers
            JOIN FETCH q.chapter c
            JOIN FETCH c.subject
            WHERE q.questionId IN :questionIds
            """)
    List<Question> findWithDetailsByQuestionIds(@Param("questionIds") List<Long> questionIds);
}
