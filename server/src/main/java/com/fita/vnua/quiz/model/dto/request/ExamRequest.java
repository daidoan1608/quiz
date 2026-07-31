package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.dto.ExamDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequest {
    @Valid
    @NotNull(message = "Thông tin đề thi không được để trống")
    private ExamDto examDto;
    @Min(value = 0, message = "Tổng số câu hỏi không được âm")
    private int totalQuestions;
    @Min(value = 0, message = "Số câu dễ không được âm")
    private int easyQuestions;
    @Min(value = 0, message = "Số câu khó không được âm")
    private int hardQuestions;
    @Min(value = 0, message = "Số câu trung bình không được âm")
    private int mediumQuestions;
    private Map<@NotNull(message = "Chương không được để trống") Long, @Min(value = 0, message = "Số câu theo chương không được âm") Integer> totalQuestionByChapter;
    @Pattern(regexp = "(?i)^(TOTAL|DIFFICULTY|CHAPTER|MANUAL)?$", message = "Phương thức tạo đề không hợp lệ")
    private String generationMode;
    private List<@NotNull(message = "Câu hỏi không được để trống") Long> questionIds;
}
