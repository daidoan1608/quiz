package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.ExamInfo;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.SubjectSummaryDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Category;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ModelMapper modelMapper;
    private final SoftDeleteService softDeleteService;

    @Override
    public List<SubjectSummaryDto> getAllSubject() {
        return subjectRepository.findByDeletedFalse().stream()
                .map(this::mapSubjectToSummaryDto)
                .toList();
    }

    @Override
    public List<SubjectSummaryDto> getDeletedSubjects() {
        return subjectRepository.findByDeletedTrue().stream()
                .map(this::mapSubjectToSummaryDto)
                .toList();
    }

    @Override
    public List<SubjectSummaryDto> searchSubjects(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllSubject();
        }
        return subjectRepository.searchActive(keyword.trim())
                .stream()
                .map(this::mapSubjectToSummaryDto)
                .toList();
    }

    @Override
    public List<SubjectSummaryDto> getSubjectsByCategoryId(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomApiException("Category not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(category.getDeleted())) {
            return List.of();
        }
        return subjectRepository.findSubjectsByCategoryAndDeletedFalse(category).stream()
                .map(this::mapSubjectToSummaryDto)
                .toList();
    }

    @Override
    public SubjectDto getSubjectById(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getDeleted())) {
            throw new CustomApiException("Subject not found", HttpStatus.NOT_FOUND);
        }

        // Gọi hàm helper để lấy chi tiết
        return mapSubjectToDetailedDto(subject);
    }

    @Override
    public SubjectDto create(SubjectDto subjectDto) {
        Category category = categoryRepository.findById(subjectDto.getCategoryId())
                .orElseThrow(() -> new CustomApiException("Category not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new CustomApiException("Category not found", HttpStatus.NOT_FOUND);
        }
        Subject subject = subjectRepository.save(modelMapper.map(subjectDto, Subject.class));
        subject.setCategory(category);
        Subject savedSubject = subjectRepository.save(subject);
        return modelMapper.map(savedSubject, SubjectDto.class);
    }

    @Override
    public SubjectDto update(Long subjectId, SubjectDto subjectDto) {
        var existingSubject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(existingSubject.getDeleted())) {
            throw new CustomApiException("Subject not found", HttpStatus.NOT_FOUND);
        }

        existingSubject.setName(subjectDto.getName());
        existingSubject.setDescription(subjectDto.getDescription());
        return modelMapper.map(subjectRepository.save(existingSubject), SubjectDto.class);
    }

    @Override
    public Response delete(Long subjectId) {
        softDeleteService.deleteSubject(subjectId, null);
        return Response.builder()
                .responseMessage("Subject deleted successfully")
                .responseCode("200 OK").build();
    }

    @Override
    public SubjectDto restore(Long subjectId) {
        softDeleteService.restoreSubject(subjectId);
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        return mapSubjectToDetailedDto(subject);
    }

    @Override
    public List<SubjectSummaryDto> getSubjectsByUser(UUID userId) {
        List<Subject> subjects = subjectRepository.findSubjectsWithUserExams(userId);
        return subjects.stream().map(this::mapSubjectToSummaryDto).toList();
    }

    private SubjectSummaryDto mapSubjectToSummaryDto(Subject subject) {
        SubjectSummaryDto subjectDto = modelMapper.map(subject, SubjectSummaryDto.class);
        List<Exam> exams = examRepository.findExamsBySubjectId(subject.getSubjectId());
        List<Chapter> chapters = chapterRepository.findBySubject(subject.getSubjectId());
        long totalQuestions = chapters.stream()
                .mapToLong(questionRepository::countByChapter)
                .sum();
        subjectDto.setTotalChapters(chapters.size());
        subjectDto.setTotalExams(exams.size());
        subjectDto.setTotalQuestions(totalQuestions);
        return subjectDto;
    }

    private SubjectDto mapSubjectToDetailedDto(Subject subject) {
        SubjectDto subjectDto = modelMapper.map(subject, SubjectDto.class);

        // --- 1. Xử lý Exams ---
        List<Exam> exams = examRepository.findExamsBySubjectId(subject.getSubjectId());
        List<ExamInfo> examInfos = new ArrayList<>();

        for (Exam exam : exams) {
            ExamInfo examInfo = modelMapper.map(exam, ExamInfo.class);
            Long totalQuestions = examQuestionRepository.countByExam(exam);
            examInfo.setTotalQuestions(totalQuestions);
            examInfos.add(examInfo);
        }

        // --- 2. Xử lý Chapters & Questions ---
        List<Chapter> chapters = chapterRepository.findBySubject(subject.getSubjectId());
        List<ChapterDto> chapterDtos = new ArrayList<>();
        long totalQuestionsOfSubject = 0;

        for (Chapter chapter : chapters) {
            ChapterDto chapterDto = modelMapper.map(chapter, ChapterDto.class);

            // Đếm số câu hỏi của chương
            long questionCount = questionRepository.countByChapter(chapter);
            chapterDto.setCountQuestion(questionCount);

            // Cộng dồn tổng câu hỏi
            totalQuestionsOfSubject += questionCount;

            chapterDtos.add(chapterDto);
        }

        // --- 3. Set các thông số tổng hợp ---
        subjectDto.setTotalChapters((long) chapters.size());
        // Tối ưu: Dùng exams.size() thay vì gọi thêm query countBySubject nếu đã load list exams
        subjectDto.setTotalExams((long) exams.size());
        subjectDto.setTotalQuestions(totalQuestionsOfSubject);

        subjectDto.setExams(examInfos);
        subjectDto.setChapters(chapterDtos);

        return subjectDto;
    }
}
