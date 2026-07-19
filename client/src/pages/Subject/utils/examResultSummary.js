export const getAnswerId = (answer) => answer?.optionId || answer?.answerId;

const sameAnswerSet = (a, b) =>
  a.length === b.length && a.every((id) => b.includes(id));

export const buildQuestionResults = (questions = [], userAnswerDtos = []) => {
  const userAnswerIdsByQuestion = userAnswerDtos.reduce((acc, userAnswer) => {
    if (!userAnswer.questionId || !userAnswer.answerId) return acc;
    acc[userAnswer.questionId] = acc[userAnswer.questionId] || [];
    if (!acc[userAnswer.questionId].includes(userAnswer.answerId)) {
      acc[userAnswer.questionId].push(userAnswer.answerId);
    }
    return acc;
  }, {});

  return questions.map((question) => {
    const selectedIds = userAnswerIdsByQuestion[question.questionId] || [];
    const correctIds = (question.answers || [])
      .filter((answer) => answer.isCorrect)
      .map(getAnswerId)
      .filter(Boolean);
    const isSkipped = selectedIds.length === 0;
    const isCorrect = !isSkipped && sameAnswerSet(selectedIds, correctIds);
    return { question, selectedIds, correctIds, isSkipped, isCorrect };
  });
};

export const buildResultSummary = ({ examData, totalQuestions, userAnswers }) => {
  const questionResults = buildQuestionResults(
    examData?.questions || [],
    userAnswers?.userAnswerDtos || []
  );
  const rawScore = userAnswers?.userExamDto?.score || 0;
  const calculatedTotal = examData?.questions?.length || totalQuestions || 1;
  const calculatedCorrect = questionResults.filter(
    (result) => result.isCorrect
  ).length;
  const answeredQuestions = questionResults.filter(
    (result) => !result.isSkipped
  ).length;
  const skippedAnswers = calculatedTotal - answeredQuestions;
  const wrongAnswers = answeredQuestions - calculatedCorrect;
  const answeredTotal = answeredQuestions || 1;
  const accuracyOnAnswered =
    Math.round((calculatedCorrect / answeredTotal) * 100) || 0;
  const totalForPercentage = calculatedTotal || 100;
  const correctPercentageOnTotal =
    Math.round((calculatedCorrect / totalForPercentage) * 100) || 0;
  const wrongPercentageOnTotal =
    Math.round((wrongAnswers / totalForPercentage) * 100) || 0;
  const skippedPercentageOnTotal =
    100 - correctPercentageOnTotal - wrongPercentageOnTotal;

  return {
    accuracyOnAnswered,
    calculatedCorrect,
    calculatedTotal,
    correctPercentageOnTotal,
    correctStroke: correctPercentageOnTotal,
    questionResults,
    rawScore,
    skippedAnswers,
    skippedPercentageOnTotal,
    skippedStroke: skippedPercentageOnTotal,
    wrongAnswers,
    wrongPercentageOnTotal,
    wrongStroke: wrongPercentageOnTotal,
  };
};
