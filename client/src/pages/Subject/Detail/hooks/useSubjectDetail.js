import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { subjectApi } from 'api/services/subjectApi';
import { useAuth } from 'context/auth/AuthProvider';
import { useFavorites } from 'context/favorites/FavoritesContext';
import { useLanguage } from 'context/language/LanguageProvider';
import {
  buildChapterPracticeLocation,
  buildExamAttemptLocation,
  buildSubjectPracticeLocation,
  mapInProgressAttemptsByExamId,
} from 'pages/Subject/utils/subjectNavigation';
import {
  getEstimatedStudyHours,
  getSubjectDetailProgress,
} from 'pages/Subject/utils/subjectPresentation';

export const useSubjectDetail = () => {
  const [subjectData, setSubjectData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [inProgressExams, setInProgressExams] = useState(new Map());

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const subjectId = location.state?.subjectId || params.subjectId;
  const { isLoggedIn } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { texts } = useLanguage();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!subjectId) {
      setError(texts.subjectInfoNotFound || 'Không tìm thấy thông tin môn học');
      setIsLoading(false);
      return;
    }

    const fetchSubjectDetails = async () => {
      try {
        setIsLoading(true);
        const data = await subjectApi.getPublicSubject(subjectId);
        if (data) {
          setSubjectData(data);
        } else {
          setError(
            texts.subjectDataNotFound || 'Không tìm thấy dữ liệu môn học.'
          );
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
        setError(
          texts.loadDataError ||
            'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [
    subjectId,
    texts.loadDataError,
    texts.subjectDataNotFound,
    texts.subjectInfoNotFound,
  ]);

  useEffect(() => {
    const fetchInProgressExams = async () => {
      if (!isLoggedIn || !userId) {
        setInProgressExams(new Map());
        return;
      }

      try {
        const attempts = await subjectApi.getInProgressAttempts(userId);
        setInProgressExams(mapInProgressAttemptsByExamId(attempts));
      } catch (err) {
        console.error('Lỗi tải đề đang làm dở:', err);
        setInProgressExams(new Map());
      }
    };

    fetchInProgressExams();
  }, [isLoggedIn, userId]);

  const chapters = subjectData?.chapters || [];
  const exams = subjectData?.exams || [];
  const estimatedHours = getEstimatedStudyHours(subjectData);
  const isFavorited = subjectData
    ? favorites.some((fav) => fav.subjectId === subjectData.subjectId)
    : false;
  const progress = useMemo(
    () => getSubjectDetailProgress(subjectData),
    [subjectData]
  );

  const requireLogin = () => {
    if (isLoggedIn) return true;
    setShowLoginPrompt(true);
    return false;
  };

  const handleChapterClick = (chapter) => {
    if (!requireLogin()) return;
    navigate(buildChapterPracticeLocation({ chapter, subjectData, subjectId }));
  };

  const handleSmartPracticeClick = () => {
    if (!requireLogin()) return;
    navigate(buildSubjectPracticeLocation({ chapters, subjectData, subjectId }));
  };

  const handleExamClick = (exam) => {
    if (!requireLogin()) return;
    const inProgressAttempt = inProgressExams.get(Number(exam.examId));
    navigate(buildExamAttemptLocation({ exam, inProgressAttempt, subjectId }));
  };

  return {
    chapters,
    closeLoginPrompt: () => setShowLoginPrompt(false),
    error,
    estimatedHours,
    exams,
    handleChapterClick,
    handleExamClick,
    handleSmartPracticeClick,
    inProgressExams,
    isFavorited,
    isLoading,
    navigate,
    progress,
    showLoginPrompt,
    subjectData,
    subjectId,
    texts,
    toggleFavorite,
  };
};
