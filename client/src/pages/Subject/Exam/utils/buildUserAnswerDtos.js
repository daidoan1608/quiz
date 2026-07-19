import { normalizeSelectedIndexes } from "pages/Subject/utils/questionUtils";

export const buildUserAnswerDtos = (questions, selectedAnswers) =>
  Object.entries(selectedAnswers).flatMap(([questionIndex, answerValue]) => {
    const question = questions[questionIndex];
    if (!question) return [];
    return normalizeSelectedIndexes(answerValue)
      .map((answerIndex) => {
        const answer = question.answers?.[answerIndex];
        return answer
          ? {
              questionId: question.questionId,
              answerId: answer.answerId || answer.optionId,
            }
          : null;
      })
      .filter(Boolean);
  });
