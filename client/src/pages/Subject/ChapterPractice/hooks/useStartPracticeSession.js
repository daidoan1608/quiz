import { useCallback } from 'react';
import { appMessage } from 'utils/appMessage';
import { examApi } from 'api/services/examApi';
import { SMART_WRONG_MODES } from '../constants/practiceOptions';
import {
  createPracticeRequestParams,
  loadMarkedSubjectQuestions,
  loadPracticeQuestions,
} from '../utils/practiceData';

export const useStartPracticeSession = ({
  chapterId,
  isSubjectPractice,
  loadFallbackMarkedQuestions,
  loadMarkedQuestions,
  loadMarkedQuestionsByChapter,
  locationState,
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
}) =>
  useCallback(async () => {
    try {
      setHasRequested(true);
      setIsLoading(true);
      setPracticeConfig((prev) => ({
        ...prev,
        limit: safeQuestionLimit,
      }));
      const markedIds = loadMarkedQuestions();
      const commonParams = createPracticeRequestParams({
        isSubjectPractice,
        maxQuestionLimit,
        practiceConfig,
        safeQuestionLimit,
      });

      if (!chapterId && practiceConfig.mode === 'markedSubject') {
        const markedData = await loadMarkedSubjectQuestions({
          commonParams,
          examApi,
          loadFallbackMarkedQuestions,
          loadMarkedQuestionsByChapter,
          subjectChapters,
        });
        replaceMarkedQuestions(
          markedData.map((question) => Number(question.questionId))
        );
        setQuestions(markedData);
        setSelectedAnswers({});
        setConfirmedAnswers({});
        setCurrentQuestionIndex(0);
        setTitle('Ôn tập thông minh');
        if (locationState?.subjectName) {
          setSubjectName(locationState.subjectName);
        }
        return;
      }

      if (!chapterId && !SMART_WRONG_MODES[practiceConfig.mode]) {
        setQuestions([]);
        return;
      }

      const data = await loadPracticeQuestions({
        chapterId,
        commonParams,
        examApi,
        practiceMode: practiceConfig.mode,
        subjectId,
      });

      replaceMarkedQuestions([...markedIds]);
      setQuestions(data);
      setSelectedAnswers({});
      setConfirmedAnswers({});
      setCurrentQuestionIndex(0);
      setTitle(
        isSubjectPractice
          ? 'Ôn tập thông minh'
          : locationState?.chapterName ||
              texts.practiceQuestions ||
              'Câu hỏi ôn tập'
      );
      if (locationState?.subjectName) {
        setSubjectName(locationState.subjectName);
      }
    } catch (error) {
      console.error('Lỗi tải câu hỏi ôn tập:', error);
      if (SMART_WRONG_MODES[practiceConfig.mode]) {
        setQuestions([]);
        return;
      }
      appMessage.error('Không thể tải câu hỏi ôn tập.');
    } finally {
      setIsLoading(false);
    }
  }, [
    chapterId,
    isSubjectPractice,
    loadFallbackMarkedQuestions,
    loadMarkedQuestions,
    loadMarkedQuestionsByChapter,
    locationState?.chapterName,
    locationState?.subjectName,
    maxQuestionLimit,
    practiceConfig.mode,
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
    texts.practiceQuestions,
    texts.subjects,
  ]);

