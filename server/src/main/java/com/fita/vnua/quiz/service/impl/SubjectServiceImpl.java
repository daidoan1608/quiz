package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.ExamInfo;
import com.fita.vnua.quiz.model.dto.SubjectDto;
import com.fita.vnua.quiz.model.dto.SubjectSummaryDto;
import com.fita.vnua.quiz.model.dto.result.OperationResult;
import com.fita.vnua.quiz.model.entity.Category;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.model.entity.Exam;
import com.fita.vnua.quiz.model.entity.Subject;
import com.fita.vnua.quiz.repository.*;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.SubjectService;
import com.fita.vnua.quiz.service.mapper.ChapterMapper;
import com.fita.vnua.quiz.service.mapper.SubjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final SoftDeleteService softDeleteService;
    private final SubjectMapper subjectMapper;
    private final ChapterMapper chapterMapper;

    @Override
    public List<SubjectSummaryDto> getAllSubject() {
        return mapSubjectsToSummaryDtos(subjectRepository.findByDeletedFalse());
    }

    @Override
    public List<SubjectSummaryDto> getRandomSubjects(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        return mapSubjectsToSummaryDtos(subjectRepository.findRandomActiveSubjects(PageRequest.of(0, safeLimit)));
    }

    @Override
    public List<SubjectSummaryDto> getDeletedSubjects() {
        return mapSubjectsToSummaryDtos(subjectRepository.findByDeletedTrue());
    }

    @Override
    public List<SubjectSummaryDto> searchSubjects(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllSubject();
        }
        return mapSubjectsToSummaryDtos(subjectRepository.searchActive(keyword.trim()));
    }

    @Override
    public List<SubjectSummaryDto> filterSubjects(String keyword, Long categoryId, Boolean deleted, String sortBy, String sortDir) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        List<SubjectSummaryDto> subjects = mapSubjectsToSummaryDtos(
                subjectRepository.filterSubjects(normalizedKeyword, categoryId, deleted)
        );
        return AdminSortHelper.sort(subjects, sortBy, sortDir, Map.of(
                "subjectId", SubjectSummaryDto::getSubjectId,
                "categoryId", SubjectSummaryDto::getCategoryId,
                "name", SubjectSummaryDto::getName,
                "description", SubjectSummaryDto::getDescription,
                "totalChapters", SubjectSummaryDto::getTotalChapters,
                "totalExams", SubjectSummaryDto::getTotalExams,
                "totalQuestions", SubjectSummaryDto::getTotalQuestions,
                "deletedAt", SubjectSummaryDto::getDeletedAt
        ));
    }

    @Override
    @Cacheable(value = "publicSubjectsByCategory", key = "#categoryId")
    public List<SubjectSummaryDto> getSubjectsByCategoryId(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(category.getDeleted())) {
            return List.of();
        }
        return mapSubjectsToSummaryDtos(subjectRepository.findSubjectsByCategoryAndDeletedFalse(category));
    }

    @Override
    @Cacheable(value = "publicSubjectDetail", key = "#subjectId")
    public SubjectDto getSubjectById(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getDeleted())) {
            throw new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND);
        }

        // Gọi hàm helper để lấy chi tiết
        return mapSubjectToDetailedDto(subject);
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail"}, allEntries = true)
    public SubjectDto create(SubjectDto subjectDto) {
        Category category = categoryRepository.findById(subjectDto.getCategoryId())
                .orElseThrow(() -> new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(category.getDeleted())) {
            throw new CustomApiException("Không tìm thấy danh mục", HttpStatus.NOT_FOUND);
        }
        Subject subject = new Subject();
        subject.setName(subjectDto.getName());
        subject.setDescription(subjectDto.getDescription());
        subject.setCategory(category);
        subject.setDeleted(false);
        Subject savedSubject = subjectRepository.save(subject);
        return subjectMapper.toDto(savedSubject);
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail"}, allEntries = true)
    public SubjectDto update(Long subjectId, SubjectDto subjectDto) {
        var existingSubject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(existingSubject.getDeleted())) {
            throw new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND);
        }

        existingSubject.setName(subjectDto.getName());
        existingSubject.setDescription(subjectDto.getDescription());
        return subjectMapper.toDto(subjectRepository.save(existingSubject));
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail"}, allEntries = true)
    public OperationResult delete(Long subjectId) {
        softDeleteService.deleteSubject(subjectId, null);
        return OperationResult.builder()
                .responseMessage("Xóa môn học thành công")
                .responseCode("200 OK").build();
    }

    @Override
    @CacheEvict(value = {"publicCategories", "publicSubjectsByCategory", "publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail"}, allEntries = true)
    public SubjectDto restore(Long subjectId) {
        softDeleteService.restoreSubject(subjectId);
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
        return mapSubjectToDetailedDto(subject);
    }

    @Override
    public List<SubjectSummaryDto> getSubjectsByUser(UUID userId) {
        List<Subject> subjects = subjectRepository.findSubjectsWithUserExams(userId);
        return mapSubjectsToSummaryDtos(subjects);
    }

    private List<SubjectSummaryDto> mapSubjectsToSummaryDtos(List<Subject> subjects) {
        List<Long> subjectIds = subjects.stream()
                .map(Subject::getSubjectId)
                .toList();
        if (subjectIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> chapterCounts = countBySubjectId(
                chapterRepository.countActiveChaptersBySubjectIds(subjectIds)
        );
        Map<Long, Long> examCounts = countBySubjectId(
                examRepository.countActiveExamsBySubjectIds(subjectIds)
        );
        Map<Long, Long> questionCounts = countBySubjectId(
                questionRepository.countActiveQuestionsBySubjectIds(subjectIds)
        );

        return subjects.stream()
                .map(subject -> mapSubjectToSummaryDto(subject, chapterCounts, examCounts, questionCounts))
                .toList();
    }

    private SubjectSummaryDto mapSubjectToSummaryDto(
            Subject subject,
            Map<Long, Long> chapterCounts,
            Map<Long, Long> examCounts,
            Map<Long, Long> questionCounts
    ) {
        return subjectMapper.toSummaryDto(
                subject,
                chapterCounts.getOrDefault(subject.getSubjectId(), 0L),
                examCounts.getOrDefault(subject.getSubjectId(), 0L),
                questionCounts.getOrDefault(subject.getSubjectId(), 0L)
        );
    }

    private SubjectDto mapSubjectToDetailedDto(Subject subject) {
        SubjectDto subjectDto = subjectMapper.toDto(subject);

        // --- 1. Xử lý Exams ---
        List<Exam> exams = examRepository.findExamsBySubjectId(subject.getSubjectId());
        Map<Long, Long> examQuestionCounts = countExamQuestions(exams);
        List<ExamInfo> examInfos = new ArrayList<>();

        for (Exam exam : exams) {
            examInfos.add(subjectMapper.toExamInfo(exam, examQuestionCounts.getOrDefault(exam.getExamId(), 0L)));
        }

        // --- 2. Xử lý Chapters & Questions ---
        List<Chapter> chapters = chapterRepository.findBySubject(subject.getSubjectId());
        Map<Long, Long> chapterQuestionCounts = countChapterQuestions(chapters);
        List<ChapterDto> chapterDtos = new ArrayList<>();
        long totalQuestionsOfSubject = 0;

        for (Chapter chapter : chapters) {
            long questionCount = chapterQuestionCounts.getOrDefault(chapter.getChapterId(), 0L);
            ChapterDto chapterDto = chapterMapper.toDto(chapter, questionCount);

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

    private Map<Long, Long> countBySubjectId(List<Object[]> rows) {
        return rows.stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    private Map<Long, Long> countExamQuestions(List<Exam> exams) {
        List<Long> examIds = exams.stream()
                .map(Exam::getExamId)
                .toList();
        if (examIds.isEmpty()) {
            return Map.of();
        }
        return examRepository.countQuestionsByExamIds(examIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    private Map<Long, Long> countChapterQuestions(List<Chapter> chapters) {
        List<Long> chapterIds = chapters.stream()
                .map(Chapter::getChapterId)
                .toList();
        if (chapterIds.isEmpty()) {
            return Map.of();
        }
        return questionRepository.countActiveQuestionsByChapterIds(chapterIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }
}
