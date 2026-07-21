import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi } from 'api/services/accountApi';
import { subjectApi } from 'api/services/subjectApi';
import { useLanguage } from 'context/language/LanguageProvider';
import { useAuth } from 'context/auth/AuthProvider';
import { getCurrentUserId } from 'utils/storage';
import {
  buildLearningStats,
  normalizeExams,
} from 'pages/Account/utils/accountUtils';
import {
  MAX_DISPLAYED_ATTEMPTS,
  MAX_DISPLAYED_SUBJECTS,
} from '../constants/homeContent';

export const useHomePage = () => {
  const [subjects, setSubjects] = useState([]);
  const [inProgressAttempts, setInProgressAttempts] = useState([]);
  const [learningStats, setLearningStats] = useState(() => buildLearningStats([]));

  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const displayedSubjects = useMemo(
    () => subjects,
    [subjects]
  );
  const displayedAttempts = useMemo(
    () => inProgressAttempts.slice(0, MAX_DISPLAYED_ATTEMPTS),
    [inProgressAttempts]
  );

  const fetchSubjects = useCallback(async () => {
    try {
      const subjectsData = await subjectApi.getRandomPublicSubjects(
        MAX_DISPLAYED_SUBJECTS
      );
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách môn học:', error);
      setSubjects([]);
    }
  }, []);

  const fetchInProgressAttempts = useCallback(async () => {
    if (!isLoggedIn || !userId) {
      setInProgressAttempts([]);
      return;
    }

    try {
      const attempts = await subjectApi.getInProgressAttempts(userId);
      setInProgressAttempts(attempts || []);
    } catch (error) {
      console.error('Lỗi khi lấy bài đang thực hiện:', error);
      setInProgressAttempts([]);
    }
  }, [isLoggedIn, userId]);

  const fetchLearningStats = useCallback(async () => {
    if (!isLoggedIn || !userId) {
      setLearningStats(buildLearningStats([]));
      return;
    }

    try {
      const accountData = await accountApi.getOverview(userId);
      setLearningStats(buildLearningStats(normalizeExams(accountData.exams)));
    } catch (error) {
      console.error('Lỗi khi lấy lộ trình học tập:', error);
      setLearningStats(buildLearningStats([]));
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchInProgressAttempts();
  }, [fetchInProgressAttempts]);

  useEffect(() => {
    fetchLearningStats();
  }, [fetchLearningStats]);

  const handleSelectSubject = useCallback(
    (subjectId) => {
      navigate(`/subjects/${subjectId}`, { state: { subjectId } });
    },
    [navigate]
  );

  const handleContinueAttempt = useCallback(
    (attempt) => {
      navigate(`/subjects/${attempt.subjectId}/exams/${attempt.examId}`, {
        state: {
          subjectId: attempt.subjectId,
          examId: attempt.examId,
          userExamId: attempt.userExamId,
          title: attempt.title,
        },
      });
    },
    [navigate]
  );

  const handleStartLearning = useCallback(() => {
    navigate('/subjects');
  }, [navigate]);

  return {
    displayedAttempts,
    displayedSubjects,
    handleContinueAttempt,
    handleSelectSubject,
    handleStartLearning,
    isLoggedIn,
    learningStats,
    t,
  };
};
