export const isAnswerCorrect = (answer) =>
  Boolean(answer?.isCorrect ?? answer?.correct);

export const getQuestionType = (question) => {
  const rawType = question?.questionType || question?.typeQuestion;
  if (rawType) return rawType;
  const correctCount = (question?.answers || []).filter(isAnswerCorrect).length;
  return correctCount > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE";
};

export const isMultipleChoice = (question) =>
  getQuestionType(question) === "MULTIPLE_CHOICE";

export const normalizeSelectedIndexes = (value) =>
  Array.isArray(value) ? value : value !== undefined ? [value] : [];

export const isQuestionAnswered = (question, value) =>
  isMultipleChoice(question)
    ? Array.isArray(value) && value.length > 0
    : value !== undefined;
