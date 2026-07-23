package com.fita.vnua.quiz.model.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class BatchNotificationRequest extends GlobalNotificationRequest {
    private List<UUID> userIds; // Danh sách người nhận
}
