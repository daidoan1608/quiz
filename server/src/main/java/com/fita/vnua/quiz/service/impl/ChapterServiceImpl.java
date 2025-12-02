package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.model.entity.Chapter;
import com.fita.vnua.quiz.repository.ChapterRepository;
import com.fita.vnua.quiz.repository.QuestionRepository;
import com.fita.vnua.quiz.service.ChapterService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
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
                    // Đếm số câu hỏi theo chapterId
                    long count = questionRepository.countByChapter(chapter);
                    dto.setCountQuestion(count);
                    return dto;
                })
                .toList();
    }

    @Override
    public List<ChapterDto> getAllChapter() {
        return chapterRepository.findAll().stream().map(chapter -> modelMapper.map(chapter, ChapterDto.class)).toList();
    }

    @Override
    public Optional<ChapterDto> getChapterById(Long chapterId) {
        return chapterRepository.findById(chapterId).map(chapter -> modelMapper.map(chapter, ChapterDto.class));
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
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found"));

        existingChapter.setName(chapterDto.getName());
        existingChapter.setChapterNumber(chapterDto.getChapterNumber());
        chapterRepository.save(existingChapter);
        return modelMapper.map(existingChapter, ChapterDto.class);
    }

    @Override
    public Response delete(Long chapterId) {
        var existingChapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found"));
        chapterRepository.delete(existingChapter);
        return Response.builder()
                .responseMessage("Chapter deleted successfully")
                .responseCode("200 OK").build();
    }
}
