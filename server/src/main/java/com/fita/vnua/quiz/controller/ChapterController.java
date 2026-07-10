package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.exception.CustomApiException;
import com.fita.vnua.quiz.model.dto.ChapterDto;
import com.fita.vnua.quiz.model.dto.response.ApiResponse;
import com.fita.vnua.quiz.service.ChapterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
@Tag(name = "Chapter API", description = "API cho các chức năng liên quan đến chương")
public class ChapterController {
    private final ChapterService chapterService;

    @GetMapping("public/chapters/subject/{subjectId}")
    @Operation(summary = "Lấy danh sách chương theo Id môn (public)")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> getChapterBySubjectId(@PathVariable("subjectId") Long subjectId) {
        List<ChapterDto> chapters = chapterService.getChapterBySubject(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Chapters fetched successfully", chapters));
    }

    @GetMapping("public/chapters")
    @Operation(summary = "Lấy danh sách tất cả chương (public)")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> getAllChapter() {
        List<ChapterDto> chapters = chapterService.getAllChapter();
        return ResponseEntity.ok(ApiResponse.success("All chapters fetched successfully", chapters));
    }

    @GetMapping("public/chapters/search")
    @Operation(summary = "Tìm kiếm chương theo tên")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> searchChapters(@RequestParam("q") String keyword) {
        List<ChapterDto> chapters = chapterService.searchChapters(keyword);
        return ResponseEntity.ok(ApiResponse.success("Chapters searched successfully", chapters));
    }

    @GetMapping("public/chapters/{chapterId}")
    @Operation(summary = "Lấy chương theo Id (public)")
    public ResponseEntity<ApiResponse<ChapterDto>> getChapterById(@PathVariable("chapterId") Long chapterId) {
        ChapterDto chapter = chapterService.getChapterById(chapterId)
                .orElseThrow(() -> new CustomApiException("Chapter not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success("Chapter fetched successfully", chapter));
    }

    @PreAuthorize("hasPermission(#chapterDto.subjectId, 'Subject', 'CREATE') or hasRole('ADMIN')")
    @PostMapping("admin/chapters")
    @Operation(summary = "Tạo chương (admin)")
    public ResponseEntity<ApiResponse<ChapterDto>> createChapter(@RequestBody ChapterDto chapterDto) {
        ChapterDto createdChapter = chapterService.create(chapterDto);
        return ResponseEntity.ok(ApiResponse.success("Chapter created successfully", createdChapter));
    }

    @PreAuthorize("hasPermission(#chapterId, 'Chapter', 'UPDATE')")
    @PatchMapping("admin/chapters/{chapterId}")
    @Operation(summary = "Cập nhật chương (admin)")
    public ResponseEntity<ApiResponse<ChapterDto>> updateChapter(
            @PathVariable("chapterId") Long chapterId,
            @RequestBody ChapterDto chapterDto
    ) {
        ChapterDto updatedChapter = chapterService.update(chapterId, chapterDto);
        return ResponseEntity.ok(ApiResponse.success("Chapter updated successfully", updatedChapter));
    }

    @PreAuthorize("hasPermission(#chapterId, 'Chapter', 'DELETE')")
    @DeleteMapping("admin/chapters/{chapterId}")
    @Operation(summary = "Xóa chương (admin)")
    public ResponseEntity<Void> deleteChapter(@PathVariable("chapterId") Long chapterId) {
        chapterService.delete(chapterId);
        return ResponseEntity.noContent().build();
    }
}
