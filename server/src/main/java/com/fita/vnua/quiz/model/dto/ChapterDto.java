package com.fita.vnua.quiz.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class ChapterDto extends SoftDeleteMetadataDto {
    private Long chapterId;
    @NotBlank(message = "Tên chương không được để trống")
    @Size(max = 255, message = "Tên chương không được vượt quá 255 ký tự")
    private String name;
    @NotNull(message = "Số thứ tự chương không được để trống")
    @Min(value = 1, message = "Số thứ tự chương phải lớn hơn 0")
    private Integer ChapterNumber;
    @NotNull(message = "Môn học không được để trống")
    private Long subjectId;
    private Long countQuestion;
}
