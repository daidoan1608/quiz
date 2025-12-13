package com.fita.vnua.quiz.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public interface NotificationResponse {
    Long getId();

    String getTitle();

    String getMessage();

    String getType();          // Trả về "GLOBAL" hoặc "PERSONAL"

    Long getRelatedId();       // ID đề thi/bài viết

    String getRelatedType();   // Loại liên kết

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    Long getIsReadRaw();

    default Boolean getIsRead() {
        return getIsReadRaw() != null && getIsReadRaw() == 1L;
    }       // <--- Quan trọng: Giá trị đã tính toán

    LocalDateTime getCreatedAt();
}