export const clampQuestionIndex = (value, questions = []) =>
  Math.min(Math.max(Number(value) || 0, 0), Math.max(questions.length - 1, 0));

export const readExamDraft = (draftKey) => {
  if (!draftKey) return null;

  try {
    return JSON.parse(localStorage.getItem(draftKey));
  } catch (error) {
    console.warn('Không đọc được draft bài thi:', error);
    localStorage.removeItem(draftKey);
    return null;
  }
};

export const createExamDraft = ({
  currentQuestionIndex,
  endTime,
  examId,
  selectedAnswers,
  startTime,
  subjectId,
}) => ({
  currentQuestionIndex,
  endTime,
  examId,
  selectedAnswers,
  startTime,
  subjectId,
});

export const getDraftRemainingSeconds = (endTime) =>
  Math.max(0, Math.floor((Number(endTime) - Date.now()) / 1000));
