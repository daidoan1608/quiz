import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectApi } from 'api/services/subjectApi';
import { useLanguage } from 'context/language/LanguageProvider';
import { useAuth } from 'context/auth/AuthProvider';
import { getCurrentUserId } from 'utils/storage';
import { MAX_DISPLAYED_ATTEMPTS, MAX_DISPLAYED_SUBJECTS } from '../constants/homeContent';

export const useHomePage = () => {
  const [subjects, setSubjects] = useState([]);
  const [inProgressAttempts, setInProgressAttempts] = useState([]);

  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const displayedSubjects = useMemo(
    () => subjects.slice(0, MAX_DISPLAYED_SUBJECTS),
    [subjects]
  );
  const displayedAttempts = useMemo(
    () => inProgressAttempts.slice(0, MAX_DISPLAYED_ATTEMPTS),
    [inProgressAttempts]
  );

  const fetchSubjects = useCallback(async () => {
    try {
      const subjectsData = await subjectApi.getPublicSubjects();
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

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchInProgressAttempts();
  }, [fetchInProgressAttempts]);

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
    t,
  };
};
