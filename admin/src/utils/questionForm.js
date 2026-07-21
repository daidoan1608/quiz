export const isAnswerCorrect = (answer) =>
  Boolean(answer?.isCorrect ?? answer?.correct);

export const resolveQuestionType = (question) => {
  const rawType = question?.questionType || question?.typeQuestion;
  if (rawType) return rawType;
  const correctCount = (question?.answers || []).filter(isAnswerCorrect).length;
  return correctCount > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE";
};

export const validateCorrectAnswers = (
  questionType,
  correctAnswers,
  answerCount
) => {
  if (answerCount < 2) {
    return "Câu hỏi phải có ít nhất 2 đáp án!";
  }
  if (answerCount > 8) {
    return "Câu hỏi chỉ được có tối đa 8 đáp án!";
  }
  if (correctAnswers.some((index) => index >= answerCount)) {
    return "Đáp án đúng không hợp lệ với số lượng đáp án hiện có!";
  }
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

export const buildQuestionAnswers = (values, correctAnswers, originalAnswers = []) =>
  (values.answers || []).map((answer, index) => ({
    optionId: originalAnswers[index]?.optionId,
    content: answer?.content,
    isCorrect: correctAnswers.includes(index),
  }));

export const buildNewQuestionAnswers = (values, correctAnswers) =>
  buildQuestionAnswers(values, correctAnswers);

export const buildUpdatedQuestionAnswers = (
  values,
  originalAnswers,
  correctAnswers
) => buildQuestionAnswers(values, correctAnswers, originalAnswers);
