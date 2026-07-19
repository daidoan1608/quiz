import { useCallback, useEffect, useMemo, useState } from 'react';
import { examApi } from 'api/services/examApi';
import { subjectApi } from 'api/services/subjectApi';
import { useLanguage } from 'context/language/LanguageProvider';
import { useAuth } from 'context/auth/AuthProvider';
import { getCurrentUserId } from 'utils/storage';
import { buildCriteriaOptions } from '../constants/rankFilters';
import {
  buildDisplayedLeaderboard,
  buildSubjectOptions,
  mapRankingItem,
  normalizeSubjectNames,
} from '../utils/rankingMappers';

export const useRankings = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [currentUserRankEntry, setCurrentUserRankEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [filterCriteria, setFilterCriteria] = useState('total');

  const { isLoggedIn, user } = useAuth();
  const { texts } = useLanguage();
  const currentUserId = user || getCurrentUserId();

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rankingResponse, subjects] = await Promise.all([
        examApi.getRankings({
          params: {
            period: timeFilter,
            criteria: filterCriteria,
            subjectName: selectedSubject === 'all' ? undefined : selectedSubject,
            limit: 10,
          },
        }),
        subjectApi.getPublicSubjects(),
      ]);
      const result = rankingResponse.data;

      if (result.status !== 'success') {
        throw new Error(result.message || 'Không thể tải bảng xếp hạng');
      }

      setAllSubjects(normalizeSubjectNames(subjects));

      const rankingData = result.data || {};
      const topUsers = Array.isArray(rankingData.topUsers)
        ? rankingData.topUsers.map((item) =>
            mapRankingItem({ filterCriteria, item, texts })
          )
        : [];
      const currentUserEntry = rankingData.currentUser
        ? mapRankingItem({
            filterCriteria,
            item: rankingData.currentUser,
            texts,
          })
        : null;

      setLeaderboardData(topUsers);

      if (currentUserEntry) {
        setUserRank(currentUserEntry.rank);
        setCurrentUserRankEntry(currentUserEntry);
      } else {
        setUserRank(null);
        setCurrentUserRankEntry(null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLeaderboardData([]);
      setUserRank(null);
      setCurrentUserRankEntry(null);
    } finally {
      setIsLoading(false);
    }
  }, [filterCriteria, selectedSubject, texts.unknownUser, timeFilter]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData, isLoggedIn]);

  const criteriaOptions = useMemo(() => buildCriteriaOptions(texts), [texts]);
  const subjectSelectOptions = useMemo(
    () => buildSubjectOptions({ subjects: allSubjects, texts }),
    [allSubjects, texts.allSubjectOption]
  );
  const { displayedLeaderboard, shouldPinCurrentUser } = useMemo(
    () =>
      buildDisplayedLeaderboard({
        currentUserId,
        currentUserRankEntry,
        leaderboardData,
      }),
    [currentUserId, currentUserRankEntry, leaderboardData]
  );

  return {
    criteriaOptions,
    currentUserId,
    currentUserRankEntry,
    displayedLeaderboard,
    filterCriteria,
    isLoading,
    selectedSubject,
    setFilterCriteria,
    setSelectedSubject,
    setTimeFilter,
    shouldPinCurrentUser,
    subjectSelectOptions,
    texts,
    timeFilter,
    userRank,
  };
};
