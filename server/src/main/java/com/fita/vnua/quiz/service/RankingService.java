package com.fita.vnua.quiz.service;

import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.response.RankingResponse;
import com.fita.vnua.quiz.model.dto.result.PeriodRange;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RankingService {
    List<UserExamSummaryDto> getUserExamSummaries(LocalDateTime fromDate, LocalDateTime toDate);

    List<UserExamSummaryDto> getUserExamSummaries(String period);

    RankingResponse getRankings(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String subjectName,
            String criteria,
            int limit,
            UUID currentUserId
    );

    RankingResponse getRankings(String period, String subjectName, String criteria, int limit, UUID currentUserId);

    PeriodRange resolvePeriodRange(String period);
}