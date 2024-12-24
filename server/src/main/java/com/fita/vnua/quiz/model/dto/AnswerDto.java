package com.fita.vnua.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerDto {
    private Long optionId;   // Mã định danh của đáp án
    private Long questionId; // ID của câu hỏi mà đáp án này thuộc về
    private String content;  // Nội dung của đáp án
    private Boolean isCorrect; // Đúng hay sai, chỉ định nếu đáp án này là đúng
}
