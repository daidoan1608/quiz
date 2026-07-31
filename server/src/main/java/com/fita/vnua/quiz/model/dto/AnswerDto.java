package com.fita.vnua.quiz.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerDto {
    private Long optionId;   // Mã định danh của đáp án
    private Long questionId; // ID của câu hỏi mà đáp án này thuộc về
    @NotBlank(message = "Nội dung đáp án không được để trống")
    @Size(max = 2000, message = "Nội dung đáp án không được vượt quá 2000 ký tự")
    private String content;  // Nội dung của đáp án
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("isCorrect")
    private Boolean isCorrect; // Đúng hay sai, chỉ định nếu đáp án này là đúng
}
