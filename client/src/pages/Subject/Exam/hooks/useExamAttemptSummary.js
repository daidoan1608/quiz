import { useMemo } from 'react';
import { countAnsweredQuestions } from 'pages/Subject/utils/answerSelection';

export const useExamAttemptSummary = ({
  currentQuestionIndex,
  questions,
  selectedAnswers,
  timeLeft,
}) =>
  useMemo(() => {
    const safeTimeLeft = timeLeft ?? 0;
    const answeredCount = countAnsweredQuestions({
      questions,
      selectedAnswers,
    });

    return {
      answeredCount,
      currentQuestion: questions[currentQuestionIndex],
      hasUnansweredQuestions: answeredCount < questions.length,
      hours: Math.floor(safeTimeLeft / 3600),
      minutes: Math.floor((safeTimeLeft % 3600) / 60),
      progressPercent: questions.length
        ? (answeredCount / questions.length) * 100
        : 0,
      seconds: safeTimeLeft % 60,
    };
  }, [currentQuestionIndex, questions, selectedAnswers, timeLeft]);
