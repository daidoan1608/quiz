package com.fita.vnua.quiz.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class SubjectDto extends SoftDeleteMetadataDto {
    private Long subjectId;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 255, message = "Tên môn học không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;

    private long totalChapters;
    private long totalExams;
    private long totalQuestions;
    private List<ChapterDto> chapters;
    private List<ExamInfo> exams;
}
