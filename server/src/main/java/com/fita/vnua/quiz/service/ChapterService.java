package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.Response;

import java.util.List;

public interface ChapterService {
    List<ChapterDto> getChapterBySubject(Long subjectId);

    List<ChapterDto> getAllChapter();

    ChapterDto create(ChapterDto chapterDto);

    ChapterDto update(Long chapterId, ChapterDto chapterDto);

    Response delete(Long chapterId);
}

