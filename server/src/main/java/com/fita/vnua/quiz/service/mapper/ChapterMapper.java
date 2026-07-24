package com.fita.vnua.quiz.service.mapper;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.entity.Chapter;
import org.springframework.stereotype.Component;

@Component
public class ChapterMapper {

    public ChapterDto toDto(Chapter chapter) {
        return toDto(chapter, 0L);
    }

    public ChapterDto toDto(Chapter chapter, Long questionCount) {
        ChapterDto dto = new ChapterDto();
        dto.setChapterId(chapter.getChapterId());
        dto.setName(chapter.getName());
        dto.setChapterNumber(chapter.getChapterNumber());
        dto.setSubjectId(chapter.getSubject() == null ? null : chapter.getSubject().getSubjectId());
        dto.setCountQuestion(questionCount == null ? 0L : questionCount);
        dto.setDeleted(chapter.getDeleted());
        dto.setDeletedAt(chapter.getDeletedAt());
        dto.setDeletedBy(chapter.getDeletedBy());
        dto.setDeletedCascadeId(chapter.getDeletedCascadeId());
        dto.setDeleteOriginType(chapter.getDeleteOriginType());
        dto.setDeleteOriginId(chapter.getDeleteOriginId());
        return dto;
    }
}
