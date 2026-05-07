package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoleUpdateRequest {
    private User.Role role;
}
