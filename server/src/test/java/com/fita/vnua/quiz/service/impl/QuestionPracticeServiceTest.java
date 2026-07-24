package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.enums.QuestionDifficulty;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.model.entity.UserAnswer;
import com.fita.vnua.quiz.model.entity.UserExam;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.UserAnswerRepository;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuestionPracticeServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserAnswerRepository userAnswerRepository;

    @Mock
    private QuestionMapper questionMapper;

    @Mock
    private QuestionDetailLoader questionDetailLoader;

    @InjectMocks
    private QuestionPracticeService questionPracticeService;

    @Test
    void wrongPracticeRequiresAuthenticatedUserBeforeLoadingWrongAnswers() {
        assertThatThrownBy(() -> questionPracticeService.getPracticeQuestionsByChapter(1L, null, "ALL", "wrong", null))
                .isInstanceOf(CustomApiException.class)
                .hasMessageContaining("Vui lòng đăng nhập");

        verify(questionRepository, never()).findPracticeQuestionsByChapterAndDifficulty(any(), any(), any(Integer.class));
        verify(userAnswerRepository, never()).findSubmittedAnswersByUserAndChapter(any(), any());
    }

    @Test
    void smartWrongPracticeSortsFrequentQuestionsAndAppliesLimit() {
        UUID userId = UUID.randomUUID();
        Question first = question(1L, 10L, QuestionDifficulty.EASY, true, answer(101L, true));
        Question second = question(2L, 10L, QuestionDifficulty.EASY, true, answer(201L, true));
        Question ignoredCorrect = question(3L, 10L, QuestionDifficulty.EASY, true, answer(301L, true));
        UserAnswer firstWrongOlder = userAnswer(1L, first, answer(102L, false), LocalDateTime.of(2026, 7, 20, 8, 0));
        UserAnswer firstWrongNewer = userAnswer(2L, first, answer(102L, false), LocalDateTime.of(2026, 7, 22, 8, 0));
        UserAnswer secondWrong = userAnswer(3L, second, answer(202L, false), LocalDateTime.of(2026, 7, 23, 8, 0));
        UserAnswer correct = userAnswer(4L, ignoredCorrect, answer(301L, true), LocalDateTime.of(2026, 7, 23, 9, 0));
        QuestionDto firstDto = dto(1L);
        QuestionDto secondDto = dto(2L);

        when(userAnswerRepository.findSubmittedAnswersByUserForPractice(userId, null, null))
                .thenReturn(List.of(firstWrongOlder, firstWrongNewer, secondWrong, correct));
        when(questionMapper.toDto(first)).thenReturn(firstDto);
        when(questionMapper.toDto(second)).thenReturn(secondDto);

        List<QuestionDto> result = questionPracticeService.getSmartWrongPracticeQuestions(
                null,
                null,
                2,
                "ALL",
                "frequent",
                userId
        );

        assertThat(result)
                .extracting(QuestionDto::getQuestionId)
                .containsExactly(1L, 2L);
    }

    private Question question(Long questionId, Long chapterId, QuestionDifficulty difficulty, boolean practiceEnabled, Answer... answers) {
        Chapter chapter = new Chapter();
        chapter.setChapterId(chapterId);
        Question question = new Question();
        question.setQuestionId(questionId);
        question.setChapter(chapter);
        question.setDifficulty(difficulty);
        question.setPracticeEnabled(practiceEnabled);
        question.setAnswers(List.of(answers));
        return question;
    }

    private Answer answer(Long optionId, boolean correct) {
        Answer answer = new Answer();
        answer.setOptionId(optionId);
        answer.setIsCorrect(correct);
        answer.setContent("Answer " + optionId);
        return answer;
    }

    private UserAnswer userAnswer(Long attemptId, Question question, Answer chosenAnswer, LocalDateTime submittedAt) {
        UserExam userExam = new UserExam();
        userExam.setUserExamId(attemptId);
        userExam.setStartTime(submittedAt.minusMinutes(30));
        userExam.setEndTime(submittedAt);
        UserAnswer userAnswer = new UserAnswer();
        userAnswer.setUserExam(userExam);
        userAnswer.setQuestion(question);
        userAnswer.setAnswer(chosenAnswer);
        return userAnswer;
    }

    private QuestionDto dto(Long questionId) {
        QuestionDto dto = new QuestionDto();
        dto.setQuestionId(questionId);
        return dto;
    }
}
