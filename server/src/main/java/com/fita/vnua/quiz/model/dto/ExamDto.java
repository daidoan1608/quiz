package com.fita.vnua.quiz.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class ExamDto extends SoftDeleteMetadataDto {
    private Long examId;
    @Size(max = 64, message = "Mã đề không được vượt quá 64 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9._\\-\\s]*$", message = "Mã đề chỉ được chứa chữ cái, số, dấu chấm, gạch ngang hoặc gạch dưới")
    private String examCode;
    @NotNull(message = "Môn học không được để trống")
    private Long subjectId;
    private String subjectName;
    @NotBlank(message = "Tên đề thi không được để trống")
    @Size(max = 255, message = "Tên đề thi không được vượt quá 255 ký tự")
    private String title;
    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;
    @NotNull(message = "Thời lượng làm bài không được để trống")
    @Min(value = 1, message = "Thời lượng làm bài phải lớn hơn 0")
    private Integer duration;
    private UUID createdBy;
    private String createdDate;
    private List<QuestionDto> questions;
}
