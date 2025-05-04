package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
public class ChapterController {
    private final ChapterService chapterService;

    // Lấy danh sách chương theo subjectId (public)
    @GetMapping("public/chapters/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> getChapterBySubjectId(@PathVariable("subjectId") Long subjectId) {
        try {
            List<ChapterDto> chapters = chapterService.getChapterBySubject(subjectId);
            if (chapters.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No chapter found", List.of("No chapters found for the given subject")));
            }
            return ResponseEntity.ok(ApiResponse.success("Chapters fetched successfully", chapters));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch chapters", List.of(e.getMessage())));
        }
    }

    // Lấy tất cả các chương (public)
    @GetMapping("public/chapters")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> getAllChapter() {
        try {
            List<ChapterDto> chapters = chapterService.getAllChapter();
            if (chapters.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("No chapter found", List.of("No chapters available")));
            }
            return ResponseEntity.ok(ApiResponse.success("All chapters fetched successfully", chapters));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch chapters", List.of(e.getMessage())));
        }
    }

    // Lấy chương theo chapterId (public)
    @GetMapping("public/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<Optional<ChapterDto>>> getChapterById(@PathVariable("chapterId") Long chapterId) {
        try {
            Optional<ChapterDto> chapter = chapterService.getChapterById(chapterId);
            if (chapter.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Chapter not found", List.of("No chapter found for the given ID")));
            }
            return ResponseEntity.ok(ApiResponse.success("Chapter fetched successfully", chapter));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch chapter", List.of(e.getMessage())));
        }
    }

    // Tạo chương mới (admin)
    @PostMapping("admin/chapters")
    public ResponseEntity<ApiResponse<ChapterDto>> createChapter(@RequestBody ChapterDto chapterDto) {
        try {
            ChapterDto createdChapter = chapterService.create(chapterDto);
            return ResponseEntity.ok(ApiResponse.success("Chapter created successfully", createdChapter));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create chapter", List.of(e.getMessage())));
        }
    }

    // Cập nhật chương (admin)
    @PatchMapping("admin/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<ChapterDto>> updateChapter(@PathVariable("chapterId") Long chapterId, @RequestBody ChapterDto chapterDto) {
        try {
            ChapterDto updatedChapter = chapterService.update(chapterId, chapterDto);
            return ResponseEntity.ok(ApiResponse.success("Chapter updated successfully", updatedChapter));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update chapter", List.of(e.getMessage())));
        }
    }

    // Xóa chương (admin)
    @DeleteMapping("admin/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<Object>> deleteChapter(@PathVariable("chapterId") Long chapterId) {
        try {
            chapterService.delete(chapterId);
            return ResponseEntity.ok(ApiResponse.success("Chapter deleted successfully", "Deleted chapter with id: " + chapterId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete chapter", List.of(e.getMessage())));
        }
    }
}
