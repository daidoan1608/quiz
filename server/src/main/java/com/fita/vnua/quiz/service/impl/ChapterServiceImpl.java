package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.repository.SubjectRepository;
import com.fita.vnua.quiz.service.ChapterService;
import com.fita.vnua.quiz.service.SoftDeleteService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {
    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final ModelMapper modelMapper;
    private final SoftDeleteService softDeleteService;

    @Override
    public List<ChapterDto> getChapterBySubject(Long subjectId) {
        return chapterRepository.findBySubject(subjectId)
                .stream()
                .map(chapter -> {
                    ChapterDto dto = modelMapper.map(chapter, ChapterDto.class);
                    long count = questionRepository.countByChapter(chapter);
                    dto.setCountQuestion(count);
                    return dto;
                })
                .toList();
    }

    @Override
    public List<ChapterDto> getAllChapter() {
        return chapterRepository.findByDeletedFalse().stream().map(this::mapChapterToDto).toList();
    }

    @Override
    public List<ChapterDto> getDeletedChapters() {
        return chapterRepository.findByDeletedTrue().stream().map(this::mapChapterToDto).toList();
    }

    @Override
    public List<ChapterDto> searchChapters(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllChapter();
        }
        return chapterRepository.findByNameContainingIgnoreCaseAndDeletedFalse(keyword.trim()).stream()
                .map(this::mapChapterToDto)
                .toList();
    }

    @Override
    public Optional<ChapterDto> getChapterById(Long chapterId) {
        return chapterRepository.findById(chapterId)
                .filter(chapter -> !Boolean.TRUE.equals(chapter.getDeleted()))
                .map(this::mapChapterToDto);
    }

    @Override
    public ChapterDto create(ChapterDto chapterDto) {
        var subject = subjectRepository.findById(chapterDto.getSubjectId())
                .orElseThrow(() -> new CustomApiException("Subject not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(subject.getDeleted())) {
            throw new CustomApiException("Subject not found", HttpStatus.NOT_FOUND);
        }
        Chapter chapter = modelMapper.map(chapterDto, Chapter.class);
        chapter.setSubject(subject);

        Chapter savedChapter = chapterRepository.save(chapter);

        return modelMapper.map(savedChapter, ChapterDto.class);
    }

    @Override
    public ChapterDto update(Long chapterId, ChapterDto chapterDto) {
        var existingChapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(existingChapter.getDeleted())) {
            throw new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND);
        }

        existingChapter.setName(chapterDto.getName());
        existingChapter.setChapterNumber(chapterDto.getChapterNumber());
        chapterRepository.save(existingChapter);
        return modelMapper.map(existingChapter, ChapterDto.class);
    }

    @Override
    public Response delete(Long chapterId) {
        softDeleteService.deleteChapter(chapterId, null);
        return Response.builder()
                .responseMessage("Chapter deleted successfully")
                .responseCode("200 OK").build();
    }

    @Override
    public ChapterDto restore(Long chapterId) {
        softDeleteService.restoreChapter(chapterId);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        return mapChapterToDto(chapter);
    }

    private ChapterDto mapChapterToDto(Chapter chapter) {
        ChapterDto dto = modelMapper.map(chapter, ChapterDto.class);
        dto.setCountQuestion((long) questionRepository.countByChapter(chapter));
        return dto;
    }
}
