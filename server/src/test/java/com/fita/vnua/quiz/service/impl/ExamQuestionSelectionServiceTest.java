package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExamQuestionSelectionServiceTest {

    @Mock
    private QuestionService questionService;

    @Mock
    private QuestionMapper questionMapper;

    @Mock
    private QuestionDetailLoader questionDetailLoader;

    @InjectMocks
    private ExamQuestionSelectionService selectionService;

    @Test
    void resolveManualQuestionsKeepsRequestedOrder() {
        ExamRequest request = new ExamRequest();
        request.setQuestionIds(List.of(3L, 1L, 2L));

        Question third = question(3L, 10L, false, true);
        Question first = question(1L, 10L, false, true);
        Question second = question(2L, 10L, false, true);
        when(questionDetailLoader.loadByIdsInSameOrder(List.of(3L, 1L, 2L)))
                .thenReturn(List.of(third, first, second));
        when(questionMapper.toDto(third)).thenReturn(questionDto(3L));
        when(questionMapper.toDto(first)).thenReturn(questionDto(1L));
        when(questionMapper.toDto(second)).thenReturn(questionDto(2L));

        List<QuestionDto> questions = selectionService.resolveExamQuestions(request, 10L);

        assertThat(questions)
                .extracting(QuestionDto::getQuestionId)
                .containsExactly(3L, 1L, 2L);
    }

    @Test
    void resolveExamQuestionsRejectsMultipleActiveGenerationModes() {
        ExamRequest request = new ExamRequest();
        request.setTotalQuestions(5);
        request.setQuestionIds(List.of(1L));

        assertThatThrownBy(() -> selectionService.resolveExamQuestions(request, 10L))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Chỉ được chọn một phương thức tạo đề");
    }

    @Test
    void validateSelectedQuestionsRejectsQuestionFromDifferentSubject() {
        when(questionDetailLoader.loadByIdsInSameOrder(List.of(1L)))
                .thenReturn(List.of(question(1L, 99L, false, true)));

        assertThatThrownBy(() -> selectionService.validateSelectedQuestions(List.of(questionDto(1L)), 10L))
                .isInstanceOf(CustomApiException.class)
                .hasMessage("Câu hỏi đã chọn không thuộc môn của đề thi");
    }

    private Question question(Long questionId, Long subjectId, boolean deleted, boolean examEnabled) {
        Subject subject = new Subject();
        subject.setSubjectId(subjectId);

        Chapter chapter = new Chapter();
        chapter.setChapterId(100L + questionId);
        chapter.setSubject(subject);

        Question question = new Question();
        question.setQuestionId(questionId);
        question.setChapter(chapter);
        question.setDeleted(deleted);
        question.setExamEnabled(examEnabled);
        return question;
    }

    private QuestionDto questionDto(Long questionId) {
        QuestionDto dto = new QuestionDto();
        dto.setQuestionId(questionId);
        return dto;
    }
}
