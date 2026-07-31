package com.fita.vnua.quiz.model.dto.request;

import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserExamRequest {
    @Valid
    private UserExamDto userExamDto;
    @Valid
    private List<UserAnswerDto> userAnswerDtos;
}
