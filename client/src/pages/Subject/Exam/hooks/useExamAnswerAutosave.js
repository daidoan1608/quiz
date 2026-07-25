import { useCallback, useEffect, useRef } from 'react';
import { examApi } from 'api/services/examApi';
import { buildNextSelectedAnswers } from 'pages/Subject/utils/answerSelection';
import { buildSaveAnswerPayload } from '../utils/examAttemptAnswers';

export const useExamAnswerAutosave = ({
  currentQuestionIndex,
  questions,
  setSelectedAnswers,
  timeLeft,
  userExamId,
}) => {
  const saveAnswerQueueRef = useRef(Promise.resolve());
  const userExamIdRef = useRef(null);

  useEffect(() => {
    userExamIdRef.current = userExamId;
  }, [userExamId]);

  const saveAnswerToServer = useCallback(
    (questionIndex, answerValue) => {
      const attemptId = userExamIdRef.current;
      const question = questions[questionIndex];
      if (!attemptId || !question) return;

      const payload = buildSaveAnswerPayload({
        answerValue,
        question,
        questionIndex,
        remainingTime: timeLeft ?? 0,
      });

      saveAnswerQueueRef.current = saveAnswerQueueRef.current
        .catch(() => {})
        .then(() => examApi.saveAnswer(attemptId, payload))
        .catch((error) => {
          console.error('Lỗi lưu đáp án:', error);
        });
    },
    [questions, timeLeft]
  );

  const handleAnswerSelect = useCallback(
    (answerIndex) => {
      const question = questions[currentQuestionIndex];
      if (!question) return;

      setSelectedAnswers((prev) => {
        const nextSelection = buildNextSelectedAnswers({
          answerIndex,
          currentQuestionIndex,
          previousAnswers: prev,
          question,
        });
        saveAnswerToServer(currentQuestionIndex, nextSelection.answerValue);
        return nextSelection.selectedAnswers;
      });
    },
    [
      currentQuestionIndex,
      questions,
      saveAnswerToServer,
      setSelectedAnswers,
    ]
  );

  return { handleAnswerSelect };
};
