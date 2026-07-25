import { useCallback, useEffect, useRef } from 'react';
import { appMessage } from 'utils/appMessage';
import { examApi } from 'api/services/examApi';
import { removeStorageItem } from 'utils/storage';
import { buildUserAnswerDtos } from '../utils/buildUserAnswerDtos';

export const useExamSubmission = ({
  duration,
  examDraftKey,
  examId,
  hasUnansweredQuestions,
  navigate,
  questions,
  selectedAnswers,
  setIsSubmitConfirmOpen,
  setIsSubmitting,
  setUserExamId,
  startTime,
  subjectId,
  timeLeft,
  userExamId,
  userId,
}) => {
  const handleSubmitRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setIsSubmitConfirmOpen(false);
    const endTime = new Date().toISOString();
    const userAnswerDtos = buildUserAnswerDtos(questions, selectedAnswers);

    try {
      const response = userExamId
        ? await examApi.submitAttempt(userExamId)
        : await examApi.submitUserExam({
            userExamDto: { userId, examId, startTime, endTime },
            userAnswerDtos,
          });

      if (response.status === 200) {
        setUserExamId(null);
        if (examDraftKey) removeStorageItem(examDraftKey);
        appMessage.success('Nộp bài thành công!');
        const submittedUserExamId = response.data.data.userExamId;
        navigate(
          `/subjects/${subjectId}/exams/${examId}/result?userExamId=${submittedUserExamId}`,
          {
            state: {
              examId,
              subjectId,
              userExamId: submittedUserExamId,
              timeTaken: duration * 60 - (timeLeft || 0),
              totalQuestions: questions.length,
            },
          }
        );
      }
    } catch (error) {
      console.error('Lỗi nộp bài:', error);
      appMessage.error(
        error.response?.status === 403
          ? 'Phiên đăng nhập hết hạn.'
          : 'Lỗi khi nộp bài.'
      );
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    duration,
    examDraftKey,
    examId,
    navigate,
    questions,
    selectedAnswers,
    setIsSubmitConfirmOpen,
    setIsSubmitting,
    setUserExamId,
    startTime,
    subjectId,
    timeLeft,
    userExamId,
    userId,
  ]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const requestSubmitExam = useCallback(() => {
    if (isSubmittingRef.current) return;
    if (hasUnansweredQuestions) {
      setIsSubmitConfirmOpen(true);
      return;
    }
    handleSubmit();
  }, [handleSubmit, hasUnansweredQuestions, setIsSubmitConfirmOpen]);

  const closeSubmitConfirm = useCallback(() => {
    setIsSubmitConfirmOpen(false);
  }, [setIsSubmitConfirmOpen]);

  const confirmSubmitExam = useCallback(() => {
    setIsSubmitConfirmOpen(false);
    handleSubmit();
  }, [handleSubmit, setIsSubmitConfirmOpen]);

  return {
    closeSubmitConfirm,
    confirmSubmitExam,
    handleSubmitRef,
    requestSubmitExam,
  };
};
