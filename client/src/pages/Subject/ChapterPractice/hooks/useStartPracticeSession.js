import { useCallback } from 'react';
import { message } from 'antd';
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
      });

      if (!chapterId && practiceConfig.mode === 'markedSubject') {
        const markedData = await loadMarkedSubjectQuestions({
          commonParams,
          examApi,
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
        setTitle('Câu đã lưu của môn');
        setSubjectName(locationState?.subjectName || texts.subjects || 'Môn học');
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
        locationState?.chapterName ||
          texts.practiceQuestions ||
          'Câu hỏi ôn tập'
      );
      setSubjectName(locationState?.subjectName || texts.subjects || 'Môn học');
    } catch (error) {
      console.error('Lỗi tải câu hỏi ôn tập:', error);
      if (SMART_WRONG_MODES[practiceConfig.mode]) {
        setQuestions([]);
        return;
      }
      message.error('Không thể tải câu hỏi ôn tập.');
    } finally {
      setIsLoading(false);
    }
  }, [
    chapterId,
    isSubjectPractice,
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
