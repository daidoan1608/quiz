import { useEffect, useRef } from 'react';
import { examApi } from 'api/services/examApi';

const PROGRESS_AUTOSAVE_INTERVAL_MS = 30_000;

export const useExamProgressAutosave = ({
  currentQuestionIndex,
  isDraftReady,
  timeLeft,
  userExamId,
}) => {
  const progressRef = useRef({ currentQuestionIndex, timeLeft });

  useEffect(() => {
    progressRef.current = { currentQuestionIndex, timeLeft };
  }, [currentQuestionIndex, timeLeft]);

  useEffect(() => {
    if (!isDraftReady || !userExamId) return;

    const progressTimer = setTimeout(() => {
      const progress = progressRef.current;
      if (progress.timeLeft === null) return;

      examApi
        .updateProgress(userExamId, {
          currentQuestionIndex: progress.currentQuestionIndex,
          remainingTime: progress.timeLeft,
        })
        .catch((error) => console.error('Lỗi lưu tiến độ bài thi:', error));
    }, 500);

    return () => clearTimeout(progressTimer);
  }, [currentQuestionIndex, isDraftReady, userExamId]);

  useEffect(() => {
    if (!isDraftReady || !userExamId) return;

    const progressInterval = setInterval(() => {
      const progress = progressRef.current;
      if (progress.timeLeft === null) return;

      examApi
        .updateProgress(userExamId, {
          currentQuestionIndex: progress.currentQuestionIndex,
          remainingTime: progress.timeLeft,
        })
        .catch((error) => console.error('Lỗi lưu tiến độ bài thi:', error));
    }, PROGRESS_AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(progressInterval);
  }, [isDraftReady, userExamId]);
};
