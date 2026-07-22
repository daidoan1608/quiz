import {
  isMultipleChoice,
  isQuestionAnswered,
  normalizeSelectedIndexes,
} from './questionUtils';

export const buildNextSelectedAnswers = ({
  answerIndex,
  currentQuestionIndex,
  previousAnswers,
  question,
}) => {
  if (isMultipleChoice(question)) {
    const currentSelection = normalizeSelectedIndexes(
      previousAnswers[currentQuestionIndex]
    );
    const nextSelection = currentSelection.includes(answerIndex)
      ? currentSelection.filter((idx) => idx !== answerIndex)
      : [...currentSelection, answerIndex];
    const nextAnswers = { ...previousAnswers };

    if (nextSelection.length) {
      nextAnswers[currentQuestionIndex] = nextSelection;
    } else {
      delete nextAnswers[currentQuestionIndex];
    }

    return {
      answerValue: nextSelection,
      selectedAnswers: nextAnswers,
    };
  }

  return {
    answerValue: answerIndex,
    selectedAnswers: {
      ...previousAnswers,
      [currentQuestionIndex]: answerIndex,
    },
  };
};

export const countAnsweredQuestions = ({
  confirmedAnswers = {},
  questions,
  selectedAnswers,
  requireConfirmationForMultiple = false,
}) =>
  questions.reduce((count, question, index) => {
    const answered =
      requireConfirmationForMultiple && isMultipleChoice(question)
        ? confirmedAnswers[index]
        : isQuestionAnswered(question, selectedAnswers[index]);

    return answered ? count + 1 : count;
  }, 0);

export const getNextQuestionIndex = (currentIndex, questionCount) =>
  Math.min(Math.max(questionCount - 1, 0), currentIndex + 1);

export const getPreviousQuestionIndex = (currentIndex) =>
  Math.max(0, currentIndex - 1);

export const getUniqueAnswers = (answers = []) => {
  const seen = new Set();

  return answers.filter((answer) => {
    const key = answer.optionId || `${answer.content}-${answer.isCorrect}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
