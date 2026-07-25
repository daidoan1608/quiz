import { useCallback, useEffect, useMemo, useState } from "react";
import { examApi, statisticsApi, subjectApi } from "../../../api/services";

const DEFAULT_STATISTICS = {
  totalSubjects: 0,
  totalQuestions: 0,
  totalUsers: 0,
  totalExams: 0,
  summary: {
    totalAttempts: 0,
    submittedAttempts: 0,
    completionRate: 0,
    averageScore: 0,
    passRate: 0,
  },
  attemptsByDay: [],
  hotSubjects: [],
  mostWrongQuestions: [],
  activeUsers: [],
  scoreByExam: [],
  scoreBySubject: [],
  ranking: [],
};

export const useDashboardStats = (canViewStatistics) => {
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [tableLimits, setTableLimits] = useState({
    hotSubjectsLimit: 5,
    wrongQuestionsLimit: 5,
    activeUsersLimit: 5,
    examPerformanceLimit: 5,
    subjectPerformanceLimit: 5,
    rankingLimit: 5,
  });
  const [filters, setFilters] = useState({
    subjectId: null,
    examId: null,
    dateRange: null,
  });
  const [statistics, setStatistics] = useState(DEFAULT_STATISTICS);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  const requestParams = useMemo(() => {
    const [startedFrom, startedTo] = filters.dateRange || [];
    return {
      ...tableLimits,
      attemptsDays: 14,
      subjectId: filters.subjectId || undefined,
      examId: filters.examId || undefined,
      startedFrom: startedFrom ? startedFrom.startOf("day").format("YYYY-MM-DDTHH:mm:ss") : undefined,
      startedTo: startedTo ? startedTo.endOf("day").format("YYYY-MM-DDTHH:mm:ss") : undefined,
    };
  }, [filters, tableLimits]);

  const loadFilterOptions = useCallback(async () => {
    if (!canViewStatistics) return;
    setFilterLoading(true);
    try {
      const [subjectItems, examItems] = await Promise.all([
        subjectApi.getAll(),
        examApi.getAll(),
      ]);
      setSubjects(subjectItems);
      setExams(examItems);
    } catch (error) {
      console.error("Error fetching dashboard filters:", error);
    } finally {
      setFilterLoading(false);
    }
  }, [canViewStatistics]);

  const loadStatistics = useCallback(async () => {
    if (!canViewStatistics) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await statisticsApi.getDashboard(requestParams);
      setStatistics((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [canViewStatistics, requestParams]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const updateLimit = (key) => (value) => {
    setTableLimits((prev) => ({ ...prev, [key]: value }));
  };

  const updateFilter = (key) => (value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value || null };
      if (key === "subjectId") {
        next.examId = null;
      }
      return next;
    });
  };

  const resetFilters = () => {
    setFilters({
      subjectId: null,
      examId: null,
      dateRange: null,
    });
  };

  const filteredExams = useMemo(() => {
    if (!filters.subjectId) return exams;
    return exams.filter((exam) => exam?.subjectId === filters.subjectId);
  }, [exams, filters.subjectId]);

  return {
    loading,
    filterLoading,
    statistics,
    tableLimits,
    filters,
    subjects,
    exams: filteredExams,
    updateLimit,
    updateFilter,
    resetFilters,
    refresh: loadStatistics,
  };
};
