package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import com.fita.vnua.quiz.model.dto.request.ExamRequest;
import com.fita.vnua.quiz.model.entity.Question;
import com.fita.vnua.quiz.service.QuestionService;
import com.fita.vnua.quiz.service.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamQuestionSelectionService {
    private final QuestionService questionService;
    private final QuestionMapper questionMapper;
    private final QuestionDetailLoader questionDetailLoader;

    public List<QuestionDto> resolveExamQuestions(ExamRequest examRequest, Long subjectId) {
        ExamGenerationMode mode = resolveGenerationMode(examRequest);
        List<QuestionDto> questions = switch (mode) {
            case TOTAL -> questionService.getQuestionsBySubjectAndNumber(subjectId, examRequest.getTotalQuestions());
            case DIFFICULTY -> resolveDifficultyQuestions(examRequest, subjectId);
            case CHAPTER -> resolveChapterQuestions(examRequest);
            case MANUAL -> resolveManualQuestions(examRequest.getQuestionIds());
        };
        validateSelectedQuestions(questions, subjectId);
        return questions;
    }

    public void validateSelectedQuestions(List<QuestionDto> questions, Long subjectId) {
        if (questions == null || questions.isEmpty()) {
            throw new CustomApiException("Vui lòng chọn ít nhất 1 câu hỏi", HttpStatus.BAD_REQUEST);
        }
        Set<Long> seenQuestionIds = new LinkedHashSet<>();
        for (QuestionDto question : questions) {
            if (question.getQuestionId() == null || !seenQuestionIds.add(question.getQuestionId())) {
                throw new CustomApiException("Danh sách câu hỏi không được trùng", HttpStatus.BAD_REQUEST);
            }
        }

        Map<Long, Question> questionsById = questionDetailLoader.loadByIdsInSameOrder(new ArrayList<>(seenQuestionIds))
                .stream()
                .collect(Collectors.toMap(Question::getQuestionId, question -> question));
        if (questionsById.size() != seenQuestionIds.size()) {
            throw new CustomApiException("Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND);
        }

        for (Long questionId : seenQuestionIds) {
            Question entity = questionsById.get(questionId);
            if (Boolean.TRUE.equals(entity.getDeleted()) || !Boolean.TRUE.equals(entity.getExamEnabled())) {
                throw new CustomApiException("Câu hỏi đã chọn không hợp lệ để tạo đề", HttpStatus.BAD_REQUEST);
            }
            Long questionSubjectId = entity.getChapter() == null || entity.getChapter().getSubject() == null
                    ? null
                    : entity.getChapter().getSubject().getSubjectId();
            if (!subjectId.equals(questionSubjectId)) {
                throw new CustomApiException("Câu hỏi đã chọn không thuộc môn của đề thi", HttpStatus.BAD_REQUEST);
            }
        }
    }

    private List<QuestionDto> resolveDifficultyQuestions(ExamRequest examRequest, Long subjectId) {
        List<QuestionDto> questionDtos = new ArrayList<>();
        if (examRequest.getEasyQuestions() > 0) {
            questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(subjectId, examRequest.getEasyQuestions(), "EASY"));
        }
        if (examRequest.getMediumQuestions() > 0) {
            questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(subjectId, examRequest.getMediumQuestions(), "MEDIUM"));
        }
        if (examRequest.getHardQuestions() > 0) {
            questionDtos.addAll(questionService.getQuestionsBySubjectAndDifficulty(subjectId, examRequest.getHardQuestions(), "HARD"));
        }
        return questionDtos;
    }

    private List<QuestionDto> resolveChapterQuestions(ExamRequest examRequest) {
        List<QuestionDto> chapterQuestions = new ArrayList<>();
        Map<Long, Integer> chapterCounts = examRequest.getTotalQuestionByChapter() == null
                ? Map.of()
                : examRequest.getTotalQuestionByChapter();
        for (Map.Entry<Long, Integer> entry : chapterCounts.entrySet()) {
            if (entry.getValue() != null && entry.getValue() > 0) {
                chapterQuestions.addAll(questionService.getQuestionsByChapter(entry.getKey(), entry.getValue()));
            }
        }
        return chapterQuestions;
    }

    private List<QuestionDto> resolveManualQuestions(List<Long> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            throw new CustomApiException("Vui lòng chọn ít nhất 1 câu hỏi", HttpStatus.BAD_REQUEST);
        }
        List<Long> uniqueIds = new ArrayList<>(new LinkedHashSet<>(questionIds));
        if (uniqueIds.size() != questionIds.size()) {
            throw new CustomApiException("Danh sách câu hỏi không được trùng", HttpStatus.BAD_REQUEST);
        }
        List<Question> questions = questionDetailLoader.loadByIdsInSameOrder(uniqueIds);
        if (questions.size() != uniqueIds.size()) {
            throw new CustomApiException("Không tìm thấy một số câu hỏi đã chọn", HttpStatus.NOT_FOUND);
        }
        return questions.stream()
                .map(questionMapper::toDto)
                .toList();
    }

    private ExamGenerationMode resolveGenerationMode(ExamRequest examRequest) {
        int activeModes = 0;
        if (examRequest.getQuestionIds() != null && !examRequest.getQuestionIds().isEmpty()) {
            activeModes++;
        }
        if (examRequest.getTotalQuestions() > 0) {
            activeModes++;
        }
        if (examRequest.getEasyQuestions() > 0 || examRequest.getMediumQuestions() > 0 || examRequest.getHardQuestions() > 0) {
            activeModes++;
        }
        Map<Long, Integer> chapterCounts = examRequest.getTotalQuestionByChapter() == null
                ? Map.of()
                : examRequest.getTotalQuestionByChapter();
        if (chapterCounts.values().stream().anyMatch(count -> count != null && count > 0)) {
            activeModes++;
        }
        if (activeModes > 1) {
            throw new CustomApiException("Chỉ được chọn một phương thức tạo đề", HttpStatus.BAD_REQUEST);
        }
        if (examRequest.getGenerationMode() != null && !examRequest.getGenerationMode().isBlank()) {
            try {
                ExamGenerationMode mode = ExamGenerationMode.valueOf(examRequest.getGenerationMode().trim().toUpperCase());
                validateExplicitModePayload(mode, examRequest, chapterCounts);
                return mode;
            } catch (IllegalArgumentException exception) {
                throw new CustomApiException("Phương thức tạo đề không hợp lệ", HttpStatus.BAD_REQUEST);
            }
        }
        if (examRequest.getQuestionIds() != null && !examRequest.getQuestionIds().isEmpty()) {
            return ExamGenerationMode.MANUAL;
        }
        if (examRequest.getTotalQuestions() > 0) {
            return ExamGenerationMode.TOTAL;
        }
        if (examRequest.getEasyQuestions() > 0 || examRequest.getMediumQuestions() > 0 || examRequest.getHardQuestions() > 0) {
            return ExamGenerationMode.DIFFICULTY;
        }
        if (chapterCounts.values().stream().anyMatch(count -> count != null && count > 0)) {
            return ExamGenerationMode.CHAPTER;
        }
        throw new CustomApiException("Vui lòng chọn phương thức tạo đề", HttpStatus.BAD_REQUEST);
    }

    private void validateExplicitModePayload(ExamGenerationMode mode, ExamRequest examRequest, Map<Long, Integer> chapterCounts) {
        switch (mode) {
            case MANUAL -> {
                if (examRequest.getQuestionIds() == null || examRequest.getQuestionIds().isEmpty()) {
                    throw new CustomApiException("Vui lòng chọn câu hỏi cho đề thủ công", HttpStatus.BAD_REQUEST);
                }
            }
            case TOTAL -> {
                if (examRequest.getTotalQuestions() <= 0) {
                    throw new CustomApiException("Tổng số câu hỏi phải lớn hơn 0", HttpStatus.BAD_REQUEST);
                }
            }
            case DIFFICULTY -> {
                if (examRequest.getEasyQuestions() <= 0 && examRequest.getMediumQuestions() <= 0 && examRequest.getHardQuestions() <= 0) {
                    throw new CustomApiException("Vui lòng nhập số câu theo độ khó", HttpStatus.BAD_REQUEST);
                }
            }
            case CHAPTER -> {
                if (chapterCounts.values().stream().noneMatch(count -> count != null && count > 0)) {
                    throw new CustomApiException("Vui lòng nhập số câu theo chương", HttpStatus.BAD_REQUEST);
                }
            }
        }
    }

    private enum ExamGenerationMode {
        TOTAL,
        DIFFICULTY,
        CHAPTER,
        MANUAL
    }
}
