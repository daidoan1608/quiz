package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.UserExamSummaryDto;
import com.fita.vnua.quiz.model.dto.response.RankingResponse;
import com.fita.vnua.quiz.model.dto.result.PeriodRange;
import com.fita.vnua.quiz.repository.UserExamRepository;
import com.fita.vnua.quiz.utils.UuidUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RankingServiceImplTest {

    @Mock
    private UserExamRepository userExamRepository;

    @InjectMocks
    private RankingServiceImpl rankingService;

    @Test
    void resolvePeriodRangeHandlesAllPeriods() {
        PeriodRange weekRange = rankingService.resolvePeriodRange("week");
        assertThat(weekRange.fromDate()).isNotNull();
        assertThat(weekRange.toDate()).isNotNull();

        PeriodRange monthRange = rankingService.resolvePeriodRange("month");
        assertThat(monthRange.fromDate()).isNotNull();
        assertThat(monthRange.toDate()).isNotNull();

        PeriodRange allRange = rankingService.resolvePeriodRange("all");
        assertThat(allRange.fromDate()).isNull();
        assertThat(allRange.toDate()).isNull();

        PeriodRange nullRange = rankingService.resolvePeriodRange(null);
        assertThat(nullRange.fromDate()).isNull();
        assertThat(nullRange.toDate()).isNull();
    }

    @Test
    void getUserExamSummariesReturnsMappedDtos() {
        UserExamRepository.UserExamSummaryProjection proj = mock(UserExamRepository.UserExamSummaryProjection.class);
        UUID userId = UUID.randomUUID();
        when(proj.getUserId()).thenReturn(UuidUtils.uuidToBytes(userId));
        when(proj.getUsername()).thenReturn("testuser");
        when(proj.getAvgScore()).thenReturn(8.5);

        when(userExamRepository.getUserExamSummaries(any(), any()))
                .thenReturn(List.of(proj));

        List<UserExamSummaryDto> result = rankingService.getUserExamSummaries("week");
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(userId);
        assertThat(result.get(0).getUsername()).isEqualTo("testuser");
    }

    @Test
    void getRankingsReturnsTopAndCurrentUser() {
        UUID currentUserId = UUID.randomUUID();
        UserExamRepository.UserExamSummaryProjection topProj = mock(UserExamRepository.UserExamSummaryProjection.class);
        when(topProj.getUserId()).thenReturn(UuidUtils.uuidToBytes(UUID.randomUUID()));

        UserExamRepository.UserExamSummaryProjection userProj = mock(UserExamRepository.UserExamSummaryProjection.class);
        when(userProj.getUserId()).thenReturn(UuidUtils.uuidToBytes(currentUserId));

        when(userExamRepository.getTopRankings(any(), any(), any(), eq("total"), eq(10)))
                .thenReturn(List.of(topProj));
        when(userExamRepository.getUserRanking(any(), any(), any(), eq("total"), any()))
                .thenReturn(Optional.of(userProj));

        RankingResponse response = rankingService.getRankings("all", null, "total", 10, currentUserId);
        assertThat(response.getTopUsers()).hasSize(1);
        assertThat(response.getCurrentUser()).isNotNull();
        assertThat(response.getCurrentUser().getUserId()).isEqualTo(currentUserId);
    }
}