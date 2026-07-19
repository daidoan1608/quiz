import { isMultipleChoice, normalizeSelectedIndexes } from 'pages/Subject/utils/questionUtils';

export const mapAttemptAnswersToSelection = (questions = [], userAnswerDtos = []) =>
  userAnswerDtos.reduce((answerIndexByQuestion, userAnswer) => {
    const questionIndex = questions.findIndex(
      (question) => question.questionId === userAnswer.questionId
    );
    if (questionIndex < 0) return answerIndexByQuestion;

    const question = questions[questionIndex];
    const answerIndex = (question?.answers || []).findIndex(
      (answer) => (answer.answerId || answer.optionId) === userAnswer.answerId
    );
    if (answerIndex < 0) return answerIndexByQuestion;

    if (isMultipleChoice(question)) {
      answerIndexByQuestion[questionIndex] = [
        ...(answerIndexByQuestion[questionIndex] || []),
        answerIndex,
      ];
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

  return {
    answerId: answerIds[0],
    answerIds,
    currentQuestionIndex: questionIndex,
    questionId: question.questionId,
    remainingTime,
  };
};
