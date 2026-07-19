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
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chương theo môn học thành công", chapters));
    }

    @GetMapping("public/chapters")
    @Operation(summary = "Lấy danh sách tất cả chương (public)")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> getAllChapter() {
        List<ChapterDto> chapters = chapterService.getAllChapter();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chương thành công", chapters));
    }

    @GetMapping("public/chapters/search")
    @Operation(summary = "Tìm kiếm chương theo tên")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> searchChapters(@RequestParam("q") String keyword) {
        List<ChapterDto> chapters = chapterService.searchChapters(keyword);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm chương thành công", chapters));
    }

    @GetMapping("public/chapters/{chapterId}")
    @Operation(summary = "Lấy chương theo Id (public)")
    public ResponseEntity<ApiResponse<ChapterDto>> getChapterById(@PathVariable("chapterId") Long chapterId) {
        ChapterDto chapter = chapterService.getChapterById(chapterId)
                .orElseThrow(() -> new CustomApiException("Không tìm thấy chương", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin chương thành công", chapter));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/chapters/filter")
    @Operation(summary = "Lọc chương cho admin")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> filterChapters(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Boolean deleted,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lọc chương thành công",
                chapterService.filterChapters(keyword, categoryId, subjectId, deleted, sortBy, sortDir)
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("admin/chapters/deleted")
    @Operation(summary = "Lấy danh sách chương đã xóa mềm")
    public ResponseEntity<ApiResponse<List<ChapterDto>>> getDeletedChapters() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chương đã xóa thành công", chapterService.getDeletedChapters()));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#chapterDto.subjectId, 'Subject', 'CREATE')")
    @PostMapping("admin/chapters")
    @Operation(summary = "Tạo chương (admin)")
    public ResponseEntity<ApiResponse<ChapterDto>> createChapter(@RequestBody ChapterDto chapterDto) {
        ChapterDto createdChapter = chapterService.create(chapterDto);
        return ResponseEntity.ok(ApiResponse.success("Tạo chương thành công", createdChapter));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#chapterId, 'Chapter', 'UPDATE')")
    @PatchMapping("admin/chapters/{chapterId}")
    @Operation(summary = "Cập nhật chương (admin)")
    public ResponseEntity<ApiResponse<ChapterDto>> updateChapter(
            @PathVariable("chapterId") Long chapterId,
            @RequestBody ChapterDto chapterDto
    ) {
        ChapterDto updatedChapter = chapterService.update(chapterId, chapterDto);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chương thành công", updatedChapter));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#chapterId, 'Chapter', 'DELETE')")
    @DeleteMapping("admin/chapters/{chapterId}")
    @Operation(summary = "Xóa chương (admin)")
    public ResponseEntity<ApiResponse<Object>> deleteChapter(@PathVariable("chapterId") Long chapterId) {
        chapterService.delete(chapterId);
        return ResponseEntity.ok(ApiResponse.success("Xóa chương thành công", null));
    }

    @PreAuthorize("hasRole('ADMIN') or hasPermission(#chapterId, 'Chapter', 'UPDATE')")
    @PatchMapping("admin/chapters/{chapterId}/restore")
    @Operation(summary = "Khôi phục chương đã xóa mềm")
    public ResponseEntity<ApiResponse<ChapterDto>> restoreChapter(@PathVariable("chapterId") Long chapterId) {
        return ResponseEntity.ok(ApiResponse.success("Khôi phục chương thành công", chapterService.restore(chapterId)));
    }
}
