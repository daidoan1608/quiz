package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.Response;

import java.util.List;
import java.util.Optional;

public interface ChapterService {
    List<ChapterDto> getChapterBySubject(Long subjectId);

    List<ChapterDto> getAllChapter();

    List<ChapterDto> getDeletedChapters();

    List<ChapterDto> searchChapters(String keyword);

    Optional<ChapterDto> getChapterById(Long chapterId);

    ChapterDto create(ChapterDto chapterDto);

    ChapterDto update(Long chapterId, ChapterDto chapterDto);

    Response delete(Long chapterId);

    ChapterDto restore(Long chapterId);
}

