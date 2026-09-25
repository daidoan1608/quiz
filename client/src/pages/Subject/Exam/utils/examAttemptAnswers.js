import { isMultipleChoice, normalizeSelectedIndexes } from 'pages/Subject/utils/questionUtils';

export const mapAttemptAnswersToSelection = (questions = [], userAnswerDtos = []) =>
  userAnswerDtos.reduce((answerIndexByQuestion, userAnswer) => {
    const questionIndex = questions.findIndex(
      (question) => String(question.questionId) === String(userAnswer.questionId)
    );
    if (questionIndex < 0) return answerIndexByQuestion;

    const question = questions[questionIndex];
    const answerIndex = (question?.answers || []).findIndex(
      (answer) =>
        String(answer.answerId ?? answer.optionId) === String(userAnswer.answerId)
    );
    if (answerIndex < 0) return answerIndexByQuestion;

    if (isMultipleChoice(question)) {
      const currentList = answerIndexByQuestion[questionIndex] || [];
      if (!currentList.includes(answerIndex)) {
        answerIndexByQuestion[questionIndex] = [...currentList, answerIndex];
      }
    } else {
      answerIndexByQuestion[questionIndex] = answerIndex;
    }

    return answerIndexByQuestion;
  }, {});

export const buildSaveAnswerPayload = ({
  answerValue,
  question,
  questionIndex,
  remainingTime,
}) => {
  const answerIds = normalizeSelectedIndexes(answerValue)
    .map((answerIndex) => question.answers?.[answerIndex])
    .filter(Boolean)
    .map((answer) => answer.answerId || answer.optionId);

  const isMulti = isMultipleChoice(question);

  return {
    ...(isMulti
      ? { answerIds }
      : { answerId: answerIds.length > 0 ? answerIds[0] : null }),
    currentQuestionIndex: questionIndex,
    questionId: question.questionId,
    remainingTime,
  };
};
