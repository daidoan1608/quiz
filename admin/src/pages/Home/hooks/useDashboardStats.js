import { useEffect, useState } from "react";
import { authAxios } from "../../../api/axiosConfig";

const DEFAULT_STATISTICS = {
  totalSubjects: 0,
  totalQuestions: 0,
  totalUsers: 0,
  totalExams: 0,
  attemptsByDay: [],
  hotSubjects: [],
  mostWrongQuestions: [],
  activeUsers: [],
};

export const useDashboardStats = (canViewStatistics) => {
  const [loading, setLoading] = useState(true);
  const [tableLimits, setTableLimits] = useState({
    hotSubjectsLimit: 5,
    wrongQuestionsLimit: 5,
    activeUsersLimit: 5,
  });
  const [statistics, setStatistics] = useState(DEFAULT_STATISTICS);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!canViewStatistics) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await authAxios.get("/admin/statistics", {
          params: {
            ...tableLimits,
            attemptsDays: 14,
          },
        });
        setStatistics((prev) => ({ ...prev, ...response.data.data }));
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [canViewStatistics, tableLimits]);

  const updateLimit = (key) => (value) => {
    setTableLimits((prev) => ({ ...prev, [key]: value }));
  };

  return {
    loading,
    statistics,
    tableLimits,
    updateLimit,
  };
};
