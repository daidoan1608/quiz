export const getAttemptProgress = (attempt) => {
  const total = Number(attempt.totalQuestions) || 0;
  const answered = Number(attempt.answeredCount) || 0;

  return total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
};

export const getAttemptKey = (attempt) =>
  attempt.attemptId || attempt.userExamId || attempt.examId;

export const formatRemainingTime = (seconds, t) => {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value <= 0) {
    return t("home.inProgress.doing");
  }

  return t("home.inProgress.remainingMinutes", {
    count: Math.ceil(value / 60),
  });
};
