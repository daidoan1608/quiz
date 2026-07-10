package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.AnswerDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.entity.Answer;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Question;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class QuestionMapper {

    public Question toEntity(QuestionDto dto, Chapter chapter) {
        return toEntity(dto, chapter, Function.identity());
    }

    public Question toEntity(QuestionDto dto, Chapter chapter, Function<String, String> imageUrlResolver) {
        Question question = new Question();
        question.setContent(dto.getContent());
        question.setDifficulty(parseDifficulty(dto.getDifficulty()));
        question.setImageUrl(imageUrlResolver.apply(dto.getImageUrl()));
        question.setQuestionType(parseQuestionType(dto.getQuestionType()));
        question.setChapter(chapter);
        question.setAnswers(toAnswers(dto.getAnswers(), question));
        return question;
    }

    public void updateEntity(Question question, QuestionDto dto) {
        question.setContent(dto.getContent());
        question.setDifficulty(parseDifficulty(dto.getDifficulty()));
        question.setImageUrl(dto.getImageUrl());
        question.setQuestionType(parseQuestionType(dto.getQuestionType()));
    }

    public List<Answer> toAnswers(List<AnswerDto> answerDtos, Question question) {
        if (answerDtos == null) {
            return new ArrayList<>();
        }

        return answerDtos.stream()
                .map(answerDto -> toAnswer(answerDto, question))
                .collect(Collectors.toList());
    }

    public Question.Difficulty parseDifficulty(String difficulty) {
        try {
            return Question.Difficulty.valueOf(difficulty.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CustomApiException("Difficulty không hợp lệ: " + difficulty, HttpStatus.BAD_REQUEST);
        }
    }

    public Question.QuestionType parseQuestionType(String questionType) {
        if (questionType == null || questionType.isBlank()) {
            return Question.QuestionType.SINGLE_CHOICE;
        }

        try {
            return Question.QuestionType.valueOf(questionType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomApiException("Question type không hợp lệ: " + questionType, HttpStatus.BAD_REQUEST);
        }
    }

    private Answer toAnswer(AnswerDto answerDto, Question question) {
        Answer answer = new Answer();
        answer.setContent(answerDto.getContent());
        answer.setIsCorrect(answerDto.getIsCorrect());
        answer.setQuestion(question);
        return answer;
    }
}
