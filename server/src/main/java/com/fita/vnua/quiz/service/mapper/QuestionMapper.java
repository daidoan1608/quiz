package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.enums.QuestionType;

import com.fita.vnua.quiz.model.enums.QuestionDifficulty;

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
        question.setExamEnabled(dto.getExamEnabled() == null || Boolean.TRUE.equals(dto.getExamEnabled()));
        question.setPracticeEnabled(dto.getPracticeEnabled() == null || Boolean.TRUE.equals(dto.getPracticeEnabled()));
        question.setChapter(chapter);
        question.setAnswers(toAnswers(dto.getAnswers(), question));
        return question;
    }

    public void updateEntity(Question question, QuestionDto dto) {
        question.setContent(dto.getContent());
        question.setDifficulty(parseDifficulty(dto.getDifficulty()));
        question.setImageUrl(dto.getImageUrl());
        question.setQuestionType(parseQuestionType(dto.getQuestionType()));
        if (dto.getExamEnabled() != null) {
            question.setExamEnabled(dto.getExamEnabled());
        }
        if (dto.getPracticeEnabled() != null) {
            question.setPracticeEnabled(dto.getPracticeEnabled());
        }
    }

    public List<Answer> toAnswers(List<AnswerDto> answerDtos, Question question) {
        if (answerDtos == null) {
            return new ArrayList<>();
        }

        return answerDtos.stream()
                .map(answerDto -> toAnswer(answerDto, question))
                .collect(Collectors.toList());
    }

    public QuestionDto toDto(Question question) {
        QuestionDto dto = new QuestionDto();
        dto.setQuestionId(question.getQuestionId());
        dto.setContent(question.getContent());
        dto.setDifficulty(question.getDifficulty() == null ? null : question.getDifficulty().name());
        dto.setChapterId(question.getChapter() == null ? null : question.getChapter().getChapterId());
        dto.setChapterName(question.getChapter() == null ? null : question.getChapter().getName());
        dto.setImageUrl(question.getImageUrl());
        dto.setQuestionType(resolveQuestionType(question).name());
        dto.setExamEnabled(question.getExamEnabled());
        dto.setPracticeEnabled(question.getPracticeEnabled());
        dto.setDeleted(question.getDeleted());
        dto.setDeletedAt(question.getDeletedAt());
        dto.setDeletedBy(question.getDeletedBy());
        dto.setDeletedCascadeId(question.getDeletedCascadeId());
        dto.setDeleteOriginType(question.getDeleteOriginType());
        dto.setDeleteOriginId(question.getDeleteOriginId());
        dto.setAnswers(question.getAnswers().stream()
                .map(this::toAnswerDto)
                .collect(Collectors.toList()));
        return dto;
    }

    public QuestionDifficulty parseDifficulty(String difficulty) {
        try {
            return QuestionDifficulty.valueOf(difficulty.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new CustomApiException("Độ khó không hợp lệ: " + difficulty, HttpStatus.BAD_REQUEST);
        }
    }

    public QuestionType parseQuestionType(String questionType) {
        if (questionType == null || questionType.isBlank()) {
            return QuestionType.SINGLE_CHOICE;
        }

        try {
            return QuestionType.valueOf(questionType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomApiException("Loại câu hỏi không hợp lệ: " + questionType, HttpStatus.BAD_REQUEST);
        }
    }

    private QuestionType resolveQuestionType(Question question) {
        if (question.getQuestionType() != null) {
            return question.getQuestionType();
        }
        long correctCount = question.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .count();
        return correctCount > 1 ? QuestionType.MULTIPLE_CHOICE : QuestionType.SINGLE_CHOICE;
    }

    private Answer toAnswer(AnswerDto answerDto, Question question) {
        Answer answer = new Answer();
        answer.setContent(answerDto.getContent());
        answer.setIsCorrect(Boolean.TRUE.equals(answerDto.getIsCorrect()));
        answer.setQuestion(question);
        return answer;
    }

    private AnswerDto toAnswerDto(Answer answer) {
        AnswerDto dto = new AnswerDto();
        dto.setOptionId(answer.getOptionId());
        dto.setQuestionId(answer.getQuestion() == null ? null : answer.getQuestion().getQuestionId());
        dto.setContent(answer.getContent());
        dto.setIsCorrect(answer.getIsCorrect());
        return dto;
    }
}
