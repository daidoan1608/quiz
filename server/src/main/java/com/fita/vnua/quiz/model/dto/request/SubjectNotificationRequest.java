package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubjectNotificationRequest {
    @NotNull(message = "Môn học không được để trống")
    private Long subjectId;
    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 255, message = "Tên môn học không được vượt quá 255 ký tự")
    private String subjectName; // Để hiển thị trong tiêu đề
    private Long examId;        // (Optional) Để click vào nhảy tới đề thi
}
