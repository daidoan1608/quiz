package com.fita.vnua.quiz.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDto extends SoftDeleteMetadataDto {
    private Long questionId;
    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Size(max = 10000, message = "Nội dung câu hỏi không được vượt quá 10000 ký tự")
    private String content;
    @NotBlank(message = "Độ khó không được để trống")
    @Pattern(regexp = "(?i)EASY|MEDIUM|HARD", message = "Độ khó chỉ được là EASY, MEDIUM hoặc HARD")
    private String difficulty;
    @NotNull(message = "Chương không được để trống")
    private Long chapterId;
    private String chapterName;
    @Size(max = 1000, message = "Đường dẫn ảnh không được vượt quá 1000 ký tự")
    private String imageUrl;
    @NotBlank(message = "Loại câu hỏi không được để trống")
    @Pattern(regexp = "(?i)SINGLE_CHOICE|MULTIPLE_CHOICE", message = "Loại câu hỏi chỉ được là SINGLE_CHOICE hoặc MULTIPLE_CHOICE")
    private String questionType;
    private Boolean examEnabled;
    private Boolean practiceEnabled;
    @Valid
    @NotNull(message = "Danh sách đáp án không được để trống")
    @Size(min = 2, max = 8, message = "Câu hỏi cần có từ 2 đến 8 đáp án")
    private List<AnswerDto> answers;
}
