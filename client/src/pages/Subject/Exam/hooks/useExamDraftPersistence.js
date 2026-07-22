import { useEffect } from 'react';
import { setStorageItem } from 'utils/storage';
import { createExamDraft } from '../utils/examAttemptDraft';

export const useExamDraftPersistence = ({
  currentQuestionIndex,
  endTimeRef,
  examDraftKey,
  examId,
  isDraftReady,
  selectedAnswers,
  startTime,
  subjectId,
  userExamId,
}) => {
  useEffect(() => {
    if (!isDraftReady || !examDraftKey || !endTimeRef.current || userExamId) {
      return;
    }

    setStorageItem(
      examDraftKey,
      JSON.stringify(
        createExamDraft({
          currentQuestionIndex,
          endTime: endTimeRef.current,
          examId,
          selectedAnswers,
          startTime,
          subjectId,
        })
      )
    );
  }, [
    currentQuestionIndex,
    endTimeRef,
    examDraftKey,
    examId,
    isDraftReady,
    selectedAnswers,
    startTime,
    subjectId,
    userExamId,
  ]);
};
