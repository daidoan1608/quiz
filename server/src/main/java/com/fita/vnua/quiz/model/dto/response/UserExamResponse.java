package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserExamResponse {
    private String subjectName;
    private String title;
    private UserExamDto userExamDto;
    private List<UserAnswerDto> userAnswerDtos;
}
