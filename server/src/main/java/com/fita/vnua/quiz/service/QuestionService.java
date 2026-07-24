package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.ImportPreviewResponse;
import com.fita.vnua.quiz.model.dto.result.OperationResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface QuestionService {

    Optional<QuestionDto> getQuestionById(Long questionId);

    List<QuestionDto> getQuestionsByChapterId(Long chapterId);

    List<QuestionDto> getPracticeQuestionsByChapter(Long chapterId, Integer limit, String difficulty, String mode, UUID userId);

    List<QuestionDto> getPracticeQuestionsByChapter(Long chapterId, Integer limit, String difficulty, String mode, UUID userId, boolean includeCorrectAnswers);

    List<QuestionDto> getSmartWrongPracticeQuestions(Long subjectId, Long chapterId, Integer limit, String difficulty, String strategy, UUID userId);

    List<QuestionDto> getSmartWrongPracticeQuestions(Long subjectId, Long chapterId, Integer limit, String difficulty, String strategy, UUID userId, boolean includeCorrectAnswers);

    List<QuestionDto> getAllQuestion();

    List<QuestionDto> getDeletedQuestions();

    List<QuestionDto> searchQuestions(String keyword);

    List<QuestionDto> filterQuestions(String keyword, Long subjectId, Long chapterId, String difficulty, Boolean deleted, Boolean examEnabled, Boolean practiceEnabled, UUID creatorId);

    Page<QuestionDto> filterQuestionsPage(String keyword, Long subjectId, Long chapterId, String difficulty, Boolean deleted, Boolean examEnabled, Boolean practiceEnabled, UUID creatorId, String usageFilter, Long excludeExamId, Boolean excludeUsedInSubject, Pageable pageable);

    Page<QuestionDto> filterQuestionsPage(String keyword, Long subjectId, Long chapterId, String difficulty, Boolean deleted, Boolean examEnabled, Boolean practiceEnabled, UUID creatorId, String usageFilter, Long excludeExamId, Boolean excludeUsedInSubject, int page, int size, String sortBy, String sortDir);

    List<QuestionDto> getQuestionsBySubject(Long subjectId);

    List<QuestionDto> getQuestionsBySubjectAndNumber(Long subjectId, int number);

    List<QuestionDto> getQuestionsBySubjectAndDifficulty(Long subjectId, int number, String difficulty);

    List<QuestionDto> getQuestionsByChapter(Long chapterId, int number );

    List<QuestionDto> getQuestionsByExamId(Long examId);

    QuestionDto create(QuestionDto questionDto);

    QuestionDto update(Long questionId, QuestionDto questionDto);

    OperationResult delete(Long questionId);

    QuestionDto restore(Long questionId);

    Map<String, Object> totalQuestionBySubject(Long subjectId);

    void importQuestionsFromExcel(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException;

    ImportPreviewResponse previewImportQuestions(MultipartFile file, Long categoryId, Long subjectId, Long chapterId) throws IOException;
}
