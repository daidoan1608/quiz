export const isAnswerCorrect = (answer) =>
  Boolean(answer?.isCorrect ?? answer?.correct);

export const resolveQuestionType = (question) => {
  const rawType = question?.questionType || question?.typeQuestion;
  if (rawType) return rawType;
  const correctCount = (question?.answers || []).filter(isAnswerCorrect).length;
  return correctCount > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE";
};

export const validateCorrectAnswers = (questionType, correctAnswers) => {
  if (correctAnswers.length === 0) {
    return "Vui lòng chọn ít nhất một đáp án đúng!";
  }
  if (questionType === "SINGLE_CHOICE" && correctAnswers.length !== 1) {
    return "Câu hỏi chọn một phải có đúng 1 đáp án đúng!";
  }
  if (questionType === "MULTIPLE_CHOICE" && correctAnswers.length < 2) {
    return "Câu hỏi chọn nhiều phải có ít nhất 2 đáp án đúng!";
  }
  return "";
};

export const buildNewQuestionAnswers = (values, correctAnswers) => [
  { content: values.answerA, isCorrect: correctAnswers.includes(0) },
  { content: values.answerB, isCorrect: correctAnswers.includes(1) },
  { content: values.answerC, isCorrect: correctAnswers.includes(2) },
  { content: values.answerD, isCorrect: correctAnswers.includes(3) },
];

export const buildUpdatedQuestionAnswers = (
  values,
  originalAnswers,
  correctAnswers
) =>
  originalAnswers.map((answer, index) => ({
    optionId: answer.optionId,
    content: values[`answer_${index}`],
    isCorrect: correctAnswers.includes(index),
  }));
