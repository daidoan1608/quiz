package com.fita.vnua.quiz.model.dto.response;

import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RankingResponse {
    private List<UserExamSummaryDto> topUsers;
    private UserExamSummaryDto currentUser;
}
