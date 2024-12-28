package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.service.impl.ChapterServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChapterController {
    private final ChapterServiceImpl chapterService;

    @GetMapping("public/subject/chapters/{subjectId}")
    public ResponseEntity<?> getChapterBySubjectId(@PathVariable("subjectId") Long subjectId) {
        List<ChapterDto> chapters = chapterService.getChapterBySubject(subjectId);
        if (chapters.isEmpty()) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No chapter found").build());
        }
        return ResponseEntity.ok(chapterService.getChapterBySubject(subjectId));
    }

    @GetMapping("public/subject/chapters")
    public ResponseEntity<?> getAllChapter() {
        List<ChapterDto> chapters = chapterService.getAllChapter();
        if (chapters.isEmpty()) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No chapter found").build());
        }
        return ResponseEntity.ok(chapterService.getAllChapter());
    }

    @PostMapping("admin/chapters")
    public ResponseEntity<?> createChapter(@RequestBody ChapterDto chapterDto) {
        return ResponseEntity.ok(chapterService.create(chapterDto));
    }

    @PatchMapping("admin/chapters/{chapterId}")
    public ResponseEntity<?> updateChapter(@PathVariable("chapterId") Long chapterId,@RequestBody ChapterDto chapterDto) {
        return ResponseEntity.ok(chapterService.update(chapterId, chapterDto));
    }

    @DeleteMapping("admin/chapters/{chapterId}")
    public ResponseEntity<?> deleteChapter(@PathVariable("chapterId") Long chapterId) {
        return ResponseEntity.ok(chapterService.delete(chapterId));
    }

}
