import { useEffect } from 'react';
import { examApi } from 'api/services/examApi';

export const useExamProgressAutosave = ({
  currentQuestionIndex,
  isDraftReady,
  timeLeft,
  userExamId,
}) => {
  useEffect(() => {
    if (!isDraftReady || !userExamId || timeLeft === null) return;

    const progressTimer = setTimeout(() => {
      examApi
        .updateProgress(userExamId, {
          currentQuestionIndex,
          remainingTime: timeLeft,
        })
        .catch((error) => console.error('Lỗi lưu tiến độ bài thi:', error));
    }, 500);

    return () => clearTimeout(progressTimer);
  }, [currentQuestionIndex, isDraftReady, timeLeft, userExamId]);
};
