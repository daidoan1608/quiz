import { mapAttemptAnswersToSelection } from './examAttemptAnswers';
import { clampQuestionIndex, getDraftRemainingSeconds } from './examAttemptDraft';

export const hydrateExistingAttempt = ({
  attempt,
  duration,
  endTimeRef,
  fallbackStartTime,
  questions,
  setCurrentQuestionIndex,
  setSelectedAnswers,
  setStartTime,
  setTimeLeft,
}) => {
  setSelectedAnswers(
    mapAttemptAnswersToSelection(questions, attempt.userAnswerDtos || [])
  );
  setCurrentQuestionIndex(
    clampQuestionIndex(attempt.currentQuestionIndex, questions)
  );

  const remainingSeconds = Math.max(
    0,
    Number(attempt.remainingTime ?? duration * 60)
  );
  endTimeRef.current = Date.now() + remainingSeconds * 1000;
  setTimeLeft(remainingSeconds);
  setStartTime(fallbackStartTime);
};

export const hydrateRestoredDraft = ({
  endTimeRef,
  fallbackStartTime,
  questions,
  restoredDraft,
  setCurrentQuestionIndex,
  setSelectedAnswers,
  setStartTime,
  setTimeLeft,
}) => {
  endTimeRef.current =
    Number(restoredDraft.endTime) > Date.now()
      ? Number(restoredDraft.endTime)
      : Date.now();
  setTimeLeft(getDraftRemainingSeconds(endTimeRef.current));
  setStartTime(restoredDraft.startTime || fallbackStartTime);
  setSelectedAnswers(restoredDraft.selectedAnswers || {});
  setCurrentQuestionIndex(
    clampQuestionIndex(restoredDraft.currentQuestionIndex, questions)
  );
};

export const hydrateNewAttempt = ({
  duration,
  endTimeRef,
  fallbackStartTime,
  setStartTime,
  setTimeLeft,
}) => {
  endTimeRef.current = Date.now() + duration * 60 * 1000;
  setTimeLeft(duration * 60);
  setStartTime(fallbackStartTime);
};
