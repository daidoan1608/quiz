package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
@Data
@EqualsAndHashCode(callSuper = true)
public class BatchNotificationRequest extends GlobalNotificationRequest {
    @NotEmpty(message = "Danh sách người nhận không được để trống")
    private List<@NotNull(message = "Người nhận không được để trống") UUID> userIds; // Danh sách người nhận
}
