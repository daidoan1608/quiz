import { useEffect, useMemo, useState } from 'react';
import { appMessage } from 'utils/appMessage';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { subjectApi } from 'api/services/subjectApi';
import { examApi } from 'api/services/examApi';
import { useLanguage } from 'context/language/LanguageProvider';
import { getCurrentUserId } from 'utils/storage';
import { typesetMath } from 'utils/typesetMath';
import {
  buildNextSelectedAnswers,
  getNextQuestionIndex,
  getPreviousQuestionIndex,
} from 'pages/Subject/utils/answerSelection';
import {
  DEFAULT_PRACTICE_CONFIG,
  SMART_WRONG_MODES,
} from '../constants/practiceOptions';
import { createWrongPracticeCountParams } from '../utils/practiceData';
import { useMarkedQuestions } from './useMarkedQuestions';
import { usePracticeDerivedState } from './usePracticeDerivedState';
import { useStartPracticeSession } from './useStartPracticeSession';

export const useChapterPractice = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [confirmedAnswers, setConfirmedAnswers] = useState({});
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [wrongPracticeSummary, setWrongPracticeSummary] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const chapterId = location.state?.chapterId || params.chapterId;
  const chapterQuestionCount = Number(location.state?.chapterQuestionCount || 0);
  const subjectId = location.state?.subjectId || params.subjectId;
  const [loadedSubjectChapters, setLoadedSubjectChapters] = useState([]);
  const subjectChapters = useMemo(
    () =>
      location.state?.chapters?.length
        ? location.state.chapters
        : loadedSubjectChapters,
    [loadedSubjectChapters, location.state?.chapters]
  );
  const isSubjectPractice = !chapterId;
  const [practiceConfig, setPracticeConfig] = useState(() =>
    isSubjectPractice
      ? {
          ...DEFAULT_PRACTICE_CONFIG,
          mode: location.state?.practiceMode || 'wrongRecent',
        }
      : DEFAULT_PRACTICE_CONFIG
  );
  const userId = getCurrentUserId() || 'guest';
  const {
    markedQuestions,
    loadFallbackMarkedQuestions,
    loadMarkedQuestions,
    loadMarkedQuestionsByChapter,
    replaceMarkedQuestions,
    toggleMarkedQuestion,
  } = useMarkedQuestions({ chapterId, userId });
  const { texts } = useLanguage();
  const maxQuestionLimit = isSubjectPractice ? 100 : chapterQuestionCount || 100;
  const effectiveQuestionLimit =
    SMART_WRONG_MODES[practiceConfig.mode] && wrongPracticeSummary !== null
      ? wrongPracticeSummary.wrongTotal
      : maxQuestionLimit;
  const safeQuestionLimit = Math.max(
    1,
    Math.min(Number(practiceConfig.limit) || 1, effectiveQuestionLimit || 1)
  );
  const {
    answeredCount,
    currentQuestion,
    displaySubjectName,
    displayTitle,
    emptyText,
    hasAnswered,
    panelTitle,
    progressPercent,
    selectedValue,
    visibleAnswers,
  } = usePracticeDerivedState({
    confirmedAnswers,
    currentQuestionIndex,
    isSubjectPractice,
    locationState: location.state,
    practiceMode: practiceConfig.mode,
    questions,
    selectedAnswers,
    subjectName,
    texts,
    title,
  });

  const handleStartPractice = useStartPracticeSession({
    chapterId,
    isSubjectPractice,
    loadMarkedQuestions,
    loadFallbackMarkedQuestions,
    loadMarkedQuestionsByChapter,
    locationState: location.state,
    maxQuestionLimit,
    practiceConfig,
    replaceMarkedQuestions,
    safeQuestionLimit,
    setConfirmedAnswers,
    setCurrentQuestionIndex,
    setHasRequested,
    setIsLoading,
    setPracticeConfig,
    setQuestions,
    setSelectedAnswers,
    setSubjectName,
    setTitle,
    subjectChapters,
    subjectId,
    texts,
  });

  useEffect(() => {
    typesetMath();
  }, [currentQuestionIndex, questions, selectedAnswers, confirmedAnswers]);

  useEffect(() => {
    if (!SMART_WRONG_MODES[practiceConfig.mode]) {
      setWrongPracticeSummary(null);
      return;
    }

    let mounted = true;

    const loadWrongQuestionTotal = async () => {
      try {
        const data = await examApi.getSmartWrongPracticeQuestionCount(
          createWrongPracticeCountParams({
            chapterId,
            practiceConfig,
            subjectId,
          })
        );
        if (!mounted) return;
        const wrongTotal = Number(data?.wrongTotal ?? data?.total ?? 0);
        const practiceTotal = Number(data?.practiceTotal || 0);
        setWrongPracticeSummary({ wrongTotal, practiceTotal });
        setPracticeConfig((prev) => ({
          ...prev,
          limit: Math.min(Math.max(Number(prev.limit) || 1, 1), Math.max(wrongTotal, 1)),
        }));
      } catch (error) {
        console.error('Lỗi tải tổng số câu sai:', error);
        if (mounted) {
          setWrongPracticeSummary(null);
        }
      }
    };

    loadWrongQuestionTotal();

    return () => {
      mounted = false;
    };
  }, [chapterId, practiceConfig.difficulty, practiceConfig.mode, subjectId]);

  useEffect(() => {
    const hasSubjectName = Boolean(subjectName || location.state?.subjectName);
    const hasChapters =
      Boolean(location.state?.chapters?.length) || loadedSubjectChapters.length > 0;

    if (!isSubjectPractice || !subjectId || (hasSubjectName && hasChapters)) {
      return;
    }

    let mounted = true;

    const loadSubjectName = async () => {
      try {
        const subject = await subjectApi.getPublicSubject(subjectId);
        if (mounted && subject?.name) {
          setSubjectName(subject.name);
        }
        if (mounted && Array.isArray(subject?.chapters)) {
          setLoadedSubjectChapters(subject.chapters);
        }
      } catch (error) {
        console.error('Lỗi tải tên môn học:', error);
      }
    };

    loadSubjectName();

    return () => {
      mounted = false;
    };
  }, [
    isSubjectPractice,
    loadedSubjectChapters.length,
    location.state?.chapters,
    location.state?.subjectName,
    subjectId,
    subjectName,
  ]);

  const handleAnswerSelect = (answerIndex) => {
    if (!currentQuestion || hasAnswered) return;

    setSelectedAnswers(
      (prev) =>
        buildNextSelectedAnswers({
          answerIndex,
          currentQuestionIndex,
          previousAnswers: prev,
          question: currentQuestion,
        }).selectedAnswers
    );
  };

  const handleConfirmMultipleAnswer = () => {
    const selections = selectedAnswers[currentQuestionIndex] || [];
    if (!Array.isArray(selections) || selections.length === 0) {
      appMessage.warning('Vui lòng chọn ít nhất một đáp án!');
      return;
    }
    setConfirmedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: true }));
  };

  return {
    answeredCount,
    confirmedAnswers,
    currentQuestion,
    currentQuestionIndex,
    displaySubjectName,
    displayTitle,
    emptyText,
    goToNextQuestion: () =>
      setCurrentQuestionIndex((prev) =>
        getNextQuestionIndex(prev, questions.length)
      ),
    goToPreviousQuestion: () =>
      setCurrentQuestionIndex(getPreviousQuestionIndex),
    handleAnswerSelect,
    handleConfirmMultipleAnswer,
    handleStartPractice,
    handleToggleMarkedQuestion: () =>
      toggleMarkedQuestion(currentQuestion),
    hasAnswered,
    hasRequested,
    isLoading,
    isSubjectPractice,
    markedQuestions,
    maxQuestionLimit,
    wrongPracticeSummary,
    navigate,
    panelTitle,
    practiceConfig,
    progressPercent,
    questions,
    selectedAnswers,
    selectedValue,
    setCurrentQuestionIndex,
    setPracticeConfig,
    subjectId,
    texts,
    visibleAnswers,
  };
};

