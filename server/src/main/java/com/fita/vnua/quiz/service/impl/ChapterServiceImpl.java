package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.service.ChapterService;
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
    private final ModelMapper modelMapper;

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
        return chapterRepository.findAll().stream().map(this::mapChapterToDto).toList();
    }

    @Override
    public List<ChapterDto> searchChapters(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllChapter();
        }
        return chapterRepository.findByNameContainingIgnoreCase(keyword.trim()).stream()
                .map(this::mapChapterToDto)
                .toList();
    }

    @Override
    public Optional<ChapterDto> getChapterById(Long chapterId) {
        return chapterRepository.findById(chapterId).map(this::mapChapterToDto);
    }

    @Override
    public ChapterDto create(ChapterDto chapterDto) {
        Chapter chapter = modelMapper.map(chapterDto, Chapter.class);

        Chapter savedChapter = chapterRepository.save(chapter);

        return modelMapper.map(savedChapter, ChapterDto.class);
    }

    @Override
    public ChapterDto update(Long chapterId, ChapterDto chapterDto) {
        var existingChapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));

        existingChapter.setName(chapterDto.getName());
        existingChapter.setChapterNumber(chapterDto.getChapterNumber());
        chapterRepository.save(existingChapter);
        return modelMapper.map(existingChapter, ChapterDto.class);
    }

    @Override
    public Response delete(Long chapterId) {
        var existingChapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        chapterRepository.delete(existingChapter);
        return Response.builder()
                .responseMessage("Chapter deleted successfully")
                .responseCode("200 OK").build();
    }

    private ChapterDto mapChapterToDto(Chapter chapter) {
        ChapterDto dto = modelMapper.map(chapter, ChapterDto.class);
        dto.setCountQuestion((long) questionRepository.countByChapter(chapter));
        return dto;
    }
}
