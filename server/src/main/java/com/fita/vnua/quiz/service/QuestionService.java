package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.response.Response;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface QuestionService {

    Optional<QuestionDto> getQuestionById(Long questionId);

    List<QuestionDto> getQuestionsByChapterId(Long chapterId);

    List<QuestionDto> getAllQuestion();

    List<QuestionDto> getQuestionsBySubject(Long subjectId);

    List<QuestionDto> getQuestionsBySubjectAndNumber(Long subjectId, int number);

    List<QuestionDto> getQuestionsByExamId(Long examId);

    QuestionDto create(QuestionDto questionDto);

    QuestionDto update(Long questionId, QuestionDto questionDto);

    Response delete(Long questionId);

    Map<String, Object> totalQuestionBySubject(Long subjectId);

}
