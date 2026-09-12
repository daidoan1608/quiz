package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.response.RankingResponse;
import com.fita.vnua.quiz.model.dto.result.PeriodRange;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.service.RankingService;
import com.fita.vnua.quiz.utils.UuidUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingServiceImpl implements RankingService {

    private final UserExamRepository userExamRepository;

    @Override
    public List<UserExamSummaryDto> getUserExamSummaries(LocalDateTime fromDate, LocalDateTime toDate) {
        List<UserExamRepository.UserExamSummaryProjection> projections = userExamRepository.getUserExamSummaries(fromDate, toDate);
        return projections.stream().map(this::mapSummaryProjection).collect(Collectors.toList());
    }

    @Override
    public List<UserExamSummaryDto> getUserExamSummaries(String period) {
        PeriodRange range = resolvePeriodRange(period);
        return getUserExamSummaries(range.fromDate(), range.toDate());
    }

    @Override
    @Cacheable(
            value = "ranking",
            key = "'rankings:' + (#fromDate == null ? 'all' : #fromDate.toString()) + ':' + (#toDate == null ? 'all' : #toDate.toString()) + ':' + (#subjectName == null ? 'all' : #subjectName) + ':' + #criteria + ':' + #limit + ':' + (#currentUserId == null ? 'anonymous' : #currentUserId.toString())"
    )
    public RankingResponse getRankings(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String subjectName,
            String criteria,
            int limit,
            UUID currentUserId
    ) {
        String normalizedSubject = subjectName == null || subjectName.isBlank() ? null : subjectName.trim();
        String normalizedCriteria = "avg".equalsIgnoreCase(criteria) ? "avg" : "total";
        int normalizedLimit = Math.min(Math.max(limit, 1), 50);

        List<UserExamSummaryDto> topUsers = userExamRepository
                .getTopRankings(fromDate, toDate, normalizedSubject, normalizedCriteria, normalizedLimit)
                .stream()
                .map(this::mapSummaryProjection)
                .toList();

        UserExamSummaryDto currentUser = null;
        if (currentUserId != null) {
            currentUser = userExamRepository
                    .getUserRanking(fromDate, toDate, normalizedSubject, normalizedCriteria, UuidUtils.uuidToBytes(currentUserId))
                    .map(this::mapSummaryProjection)
                    .orElse(null);
        }

        return new RankingResponse(topUsers, currentUser);
    }

    @Override
    public RankingResponse getRankings(String period, String subjectName, String criteria, int limit, UUID currentUserId) {
        PeriodRange range = resolvePeriodRange(period);
        return getRankings(range.fromDate(), range.toDate(), subjectName, criteria, limit, currentUserId);
    }

    @Override
    public PeriodRange resolvePeriodRange(String period) {
        LocalDate today = LocalDate.now();
        return switch (period == null ? "all" : period.toLowerCase()) {
            case "week" -> new PeriodRange(today.with(DayOfWeek.MONDAY).atStartOfDay(), today.with(DayOfWeek.MONDAY).plusWeeks(1).atStartOfDay());
            case "month" -> new PeriodRange(today.withDayOfMonth(1).atStartOfDay(), today.withDayOfMonth(1).plusMonths(1).atStartOfDay());
            default -> new PeriodRange(null, null);
        };
    }

    private UserExamSummaryDto mapSummaryProjection(UserExamRepository.UserExamSummaryProjection proj) {
        UserExamSummaryDto dto = new UserExamSummaryDto();
        dto.setUserId(UuidUtils.bytesToUUID(proj.getUserId()));
        dto.setUsername(proj.getUsername());
        dto.setAvatarUrl(proj.getAvatarUrl());
        dto.setAttemptCount(proj.getAttemptCount());
        dto.setAvgScore(proj.getAvgScore());
        dto.setTotalScore(proj.getTotalScore());
        dto.setTotalDurationSeconds(proj.getTotalDurationSeconds());
        dto.setSubjectName(proj.getSubjects());
        dto.setRank(proj.getRankPosition());
        return dto;
    }
}