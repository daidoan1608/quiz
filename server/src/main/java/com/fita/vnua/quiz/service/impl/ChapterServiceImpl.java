package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.result.OperationResult;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.ChapterService;
import com.fita.vnua.quiz.service.SoftDeleteService;
import com.fita.vnua.quiz.service.mapper.ChapterMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {
    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final SoftDeleteService softDeleteService;
    private final ChapterMapper chapterMapper;

    @Override
    @Cacheable(value = "publicChaptersBySubject", key = "#subjectId")
    public List<ChapterDto> getChapterBySubject(Long subjectId) {
        List<Chapter> chapters = chapterRepository.findBySubject(subjectId);
        Map<Long, Long> questionCounts = countQuestionsByChapter(chapters);
        return chapters.stream()
                .map(chapter -> mapChapterToDto(chapter, questionCounts))
                .toList();
    }

    @Override
    public List<ChapterDto> getAllChapter() {
        List<Chapter> chapters = chapterRepository.findByDeletedFalse();
        Map<Long, Long> questionCounts = countQuestionsByChapter(chapters);
        return chapters.stream().map(chapter -> mapChapterToDto(chapter, questionCounts)).toList();
    }

    @Override
    public List<ChapterDto> getDeletedChapters() {
        List<Chapter> chapters = chapterRepository.findByDeletedTrue();
        Map<Long, Long> questionCounts = countQuestionsByChapter(chapters);
        return chapters.stream().map(chapter -> mapChapterToDto(chapter, questionCounts)).toList();
    }

    @Override
    public List<ChapterDto> searchChapters(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllChapter();
        }
        List<Chapter> chapters = chapterRepository.findByNameContainingIgnoreCaseAndDeletedFalse(keyword.trim());
        Map<Long, Long> questionCounts = countQuestionsByChapter(chapters);
        return chapters.stream()
                .map(chapter -> mapChapterToDto(chapter, questionCounts))
                .toList();
    }

    @Override
    public List<ChapterDto> filterChapters(String keyword, Long categoryId, Long subjectId, Boolean deleted, String sortBy, String sortDir) {
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();
        List<Chapter> chapterEntities = chapterRepository.filterChapters(normalizedKeyword, categoryId, subjectId, deleted);
        Map<Long, Long> questionCounts = countQuestionsByChapter(chapterEntities);
        List<ChapterDto> chapters = chapterEntities.stream()
                .map(chapter -> mapChapterToDto(chapter, questionCounts))
                .toList();
        return AdminSortHelper.sort(chapters, sortBy, sortDir, Map.of(
                "chapterId", ChapterDto::getChapterId,
                "name", ChapterDto::getName,
                "subjectId", ChapterDto::getSubjectId,
                "chapterNumber", ChapterDto::getChapterNumber,
                "countQuestion", ChapterDto::getCountQuestion,
                "deletedAt", ChapterDto::getDeletedAt
        ));
    }

    @Override
    public Optional<ChapterDto> getChapterById(Long chapterId) {
        return chapterRepository.findById(chapterId)
                .filter(chapter -> !Boolean.TRUE.equals(chapter.getDeleted()))
                .map(this::mapChapterToDto);
    }

    @Override
    @CacheEvict(value = {"publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public ChapterDto create(ChapterDto chapterDto) {
        var subject = subjectRepository.findById(chapterDto.getSubjectId())
                .orElseThrow(() -> new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getDeleted())) {
            throw new CustomApiException("Không tìm thấy môn học", HttpStatus.NOT_FOUND);
        }
        Chapter chapter = new Chapter();
        chapter.setName(chapterDto.getName());
        chapter.setChapterNumber(chapterDto.getChapterNumber());
        chapter.setSubject(subject);
        chapter.setDeleted(false);

        Chapter savedChapter = chapterRepository.save(chapter);

        return chapterMapper.toDto(savedChapter);
    }

    @Override
    @CacheEvict(value = {"publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public ChapterDto update(Long chapterId, ChapterDto chapterDto) {
        var existingChapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(existingChapter.getDeleted())) {
            throw new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND);
        }

        existingChapter.setName(chapterDto.getName());
        existingChapter.setChapterNumber(chapterDto.getChapterNumber());
        chapterRepository.save(existingChapter);
        return chapterMapper.toDto(existingChapter);
    }

    @Override
    @CacheEvict(value = {"publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public OperationResult delete(Long chapterId) {
        softDeleteService.deleteChapter(chapterId, null);
        return OperationResult.builder()
                .responseMessage("Xóa chương thành công")
                .responseCode("200 OK").build();
    }

    @Override
    @CacheEvict(value = {"publicSubjectDetail", "publicChaptersBySubject", "publicExamsBySubject", "publicExamDetail", "practiceQuestions"}, allEntries = true)
    public ChapterDto restore(Long chapterId) {
        softDeleteService.restoreChapter(chapterId);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        return mapChapterToDto(chapter);
    }

    private ChapterDto mapChapterToDto(Chapter chapter) {
        return mapChapterToDto(chapter, Map.of(chapter.getChapterId(), (long) questionRepository.countByChapter(chapter)));
    }

    private ChapterDto mapChapterToDto(Chapter chapter, Map<Long, Long> questionCounts) {
        return chapterMapper.toDto(chapter, questionCounts.getOrDefault(chapter.getChapterId(), 0L));
    }

    private Map<Long, Long> countQuestionsByChapter(List<Chapter> chapters) {
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
