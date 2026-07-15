package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.UserAnswerDto;
import com.fita.vnua.quiz.model.dto.UserExamDto;
import com.fita.vnua.quiz.model.dto.QuestionDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserExamResponse {
    private String subjectName;
    private String title;
    private String username;
    private String fullName;
    private UserExamDto userExamDto;
    private List<UserAnswerDto> userAnswerDtos;
    private List<QuestionDto> questions;
}
