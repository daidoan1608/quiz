export const getAttemptProgress = (attempt = {}) => {
  const total = Number(attempt.totalQuestions) || 0;
  const answered = Number(attempt.answeredCount) || 0;

  return total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
};
