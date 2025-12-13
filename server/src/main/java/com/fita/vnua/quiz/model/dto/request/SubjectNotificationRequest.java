package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;

@Data
public class SubjectNotificationRequest {
    private Long subjectId;
    private String subjectName; // Để hiển thị trong tiêu đề
    private Long examId;        // (Optional) Để click vào nhảy tới đề thi
}