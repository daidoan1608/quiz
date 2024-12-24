package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserExamResponse {
    UserExamDto userExamDto;
    List<UserAnswerDto> userAnswerDtos;
}
