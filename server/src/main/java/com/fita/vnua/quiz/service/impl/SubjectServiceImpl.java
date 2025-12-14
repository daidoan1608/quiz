package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.ExamInfo;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Category;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.CategoryService;
import com.fita.vnua.quiz.service.SubjectService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
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

    @Override
    public List<SubjectDto> getAllSubject() {
        List<Subject> subjects = subjectRepository.findAll();

        // Duyệt qua từng môn học và map sang DTO chi tiết bằng hàm helper
        return subjects.stream()
                .map(this::mapSubjectToDetailedDto)
                .toList();
    }

    @Override
    public List<SubjectDto> getSubjectsByCategoryId(Long categoryId) {
        Category category = categoryRepository.findById(categoryId).get();
        List<SubjectDto> subjects = subjectRepository.findSubjectsByCategory(category).stream().map(subject -> modelMapper.map(subject, SubjectDto.class)).toList();
        for (SubjectDto subject : subjects) {
            List<ChapterDto> chapterDtos = chapterRepository.findBySubject(subject.getSubjectId()).stream().map(chapter -> modelMapper.map(chapter, ChapterDto.class)).toList();
            subject.setChapters(chapterDtos);
        }
        return subjects;
    }

    @Override
    public SubjectDto getSubjectById(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học với ID: " + subjectId));

        // Gọi hàm helper để lấy chi tiết
        return mapSubjectToDetailedDto(subject);
    }

    @Override
    public SubjectDto create(SubjectDto subjectDto) {
        Subject subject = subjectRepository.save(modelMapper.map(subjectDto, Subject.class));
        Subject savedSubject = subjectRepository.save(subject);
        return modelMapper.map(savedSubject, SubjectDto.class);
    }

    @Override
    public SubjectDto update(Long subjectId, SubjectDto subjectDto) {
        var existingSubject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found"));

        existingSubject.setName(subjectDto.getName());
        existingSubject.setDescription(subjectDto.getDescription());
        return modelMapper.map(subjectRepository.save(existingSubject), SubjectDto.class);
    }

    @Override
    public Response delete(Long subjectId) {
        var existingSubject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found"));
        subjectRepository.delete(existingSubject);
        return Response.builder()
                .responseMessage("Subject deleted successfully")
                .responseCode("200 OK").build();
    }

    @Override
    public List<SubjectDto> getSubjectsByUser(UUID userId) {
        List<Subject> subjects = subjectRepository.findSubjectsWithUserExams(userId);
        return subjects.stream().map(subject -> modelMapper.map(subject, SubjectDto.class)).toList();
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
