export { getAttemptProgress } from 'utils/attemptProgress';

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
