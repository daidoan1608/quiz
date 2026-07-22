import { useEffect } from 'react';
import { appMessage } from 'utils/appMessage';
import { examApi } from 'api/services/examApi';
import { readExamDraft } from '../utils/examAttemptDraft';
import {
  hydrateExistingAttempt,
  hydrateNewAttempt,
  hydrateRestoredDraft,
} from '../utils/examAttemptHydration';

export const useLoadExamAttempt = ({
  endTimeRef,
  examDraftKey,
  examId,
  locationState,
  navigate,
  setCurrentQuestionIndex,
  setDuration,
  setIsDraftReady,
  setIsLoading,
  setQuestions,
  setSelectedAnswers,
  setStartTime,
  setSubjectName,
  setTimeLeft,
  setTitle,
  setUserExamId,
  userId,
}) => {
  useEffect(() => {
    const loadExamAttempt = async () => {
      try {
        setIsLoading(true);
        const [examResponse, attemptResponse] = await Promise.all([
          examApi.getPublicExam(examId),
          userId
            ? examApi.startAttempt({ userId, examId })
            : Promise.resolve(null),
        ]);
        const data = examResponse.data.data;
        const attempt = attemptResponse?.data?.data;
        const examQuestions = attempt?.questions?.length
          ? attempt.questions
          : data.questions || [];
        setSubjectName(data.subjectName);
        setTitle(data.title);
        setDuration(data.duration);
        setQuestions(examQuestions);
        if (attempt?.userExamId) setUserExamId(attempt.userExamId);

        const fallbackStartTime =
          attempt?.startTime || locationState?.startTime || new Date().toISOString();
        const restoredDraft = readExamDraft(examDraftKey);

        if (attempt?.userExamId) {
          hydrateExistingAttempt({
            attempt,
            duration: data.duration,
            endTimeRef,
            fallbackStartTime,
            questions: examQuestions,
            setCurrentQuestionIndex,
            setSelectedAnswers,
            setStartTime,
            setTimeLeft,
          });
        } else if (restoredDraft?.endTime) {
          hydrateRestoredDraft({
            endTimeRef,
            fallbackStartTime,
            questions: examQuestions,
            restoredDraft,
            setCurrentQuestionIndex,
            setSelectedAnswers,
            setStartTime,
            setTimeLeft,
          });
        } else {
          hydrateNewAttempt({
            duration: data.duration,
            endTimeRef,
            fallbackStartTime,
            setStartTime,
            setTimeLeft,
          });
        }
        setIsDraftReady(true);
      } catch (error) {
        console.error('Lỗi tải đề:', error);
        appMessage.error('Không thể tải đề thi.');
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) loadExamAttempt();
  }, [
    endTimeRef,
    examDraftKey,
    examId,
    locationState?.startTime,
    navigate,
    setCurrentQuestionIndex,
    setDuration,
    setIsDraftReady,
    setIsLoading,
    setQuestions,
    setSelectedAnswers,
    setStartTime,
    setSubjectName,
    setTimeLeft,
    setTitle,
    setUserExamId,
    userId,
  ]);
};

