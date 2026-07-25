import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from 'context/language/LanguageProvider';
import { typesetMath } from 'utils/typesetMath';
import { createExamDraftKey, getCurrentUserId } from 'utils/storage';
import {
  getNextQuestionIndex,
  getPreviousQuestionIndex,
} from 'pages/Subject/utils/answerSelection';
import { useExamAnswerAutosave } from './useExamAnswerAutosave';
import { useExamCountdown } from './useExamCountdown';
import { useExamDraftPersistence } from './useExamDraftPersistence';
import { useExamProgressAutosave } from './useExamProgressAutosave';
import { useExamSubmission } from './useExamSubmission';
import { useExamAttemptSummary } from './useExamAttemptSummary';
import { useLoadExamAttempt } from './useLoadExamAttempt';
import {
  createInitialExamAttemptState,
  examAttemptActions,
  examAttemptReducer,
} from './examAttemptReducer';

export const useExamAttempt = () => {
  const [state, dispatch] = useReducer(
    examAttemptReducer,
    undefined,
    createInitialExamAttemptState
  );
  const {
    questions,
    selectedAnswers,
    timeLeft,
    duration,
    title,
    subjectName,
    currentQuestionIndex,
    isLoading,
    startTime,
    isDraftReady,
    userExamId,
    isSubmitConfirmOpen,
    isSubmitting,
  } = state;

  const endTimeRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const examId = location.state?.examId || params.examId;
  const subjectId = location.state?.subjectId || params.subjectId;
  const userId = getCurrentUserId();
  const examDraftKey = createExamDraftKey(userId, examId);
  const { texts } = useLanguage();

  const setQuestions = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_QUESTIONS, payload }),
    []
  );
  const setSelectedAnswers = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_SELECTED_ANSWERS, payload }),
    []
  );
  const setTimeLeft = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_TIME_LEFT, payload }),
    []
  );
  const setDuration = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_DURATION, payload }),
    []
  );
  const setTitle = useCallback(
    (payload) => dispatch({ type: examAttemptActions.SET_TITLE, payload }),
    []
  );
  const setSubjectName = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_SUBJECT_NAME, payload }),
    []
  );
  const setCurrentQuestionIndex = useCallback(
    (payload) =>
      dispatch({
        type: examAttemptActions.SET_CURRENT_QUESTION_INDEX,
        payload,
      }),
    []
  );
  const setIsLoading = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_IS_LOADING, payload }),
    []
  );
  const setStartTime = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_START_TIME, payload }),
    []
  );
  const setIsDraftReady = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_IS_DRAFT_READY, payload }),
    []
  );
  const setUserExamId = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_USER_EXAM_ID, payload }),
    []
  );
  const setIsSubmitConfirmOpen = useCallback(
    (payload) =>
      dispatch({
        type: examAttemptActions.SET_IS_SUBMIT_CONFIRM_OPEN,
        payload,
      }),
    []
  );
  const setIsSubmitting = useCallback(
    (payload) =>
      dispatch({ type: examAttemptActions.SET_IS_SUBMITTING, payload }),
    []
  );

  useLoadExamAttempt({
    endTimeRef,
    examDraftKey,
    examId,
    locationState: location.state,
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
  });

  const {
    answeredCount,
    currentQuestion,
    hasUnansweredQuestions,
    hours,
    minutes,
    progressPercent,
    seconds,
  } = useExamAttemptSummary({
    currentQuestionIndex,
    questions,
    selectedAnswers,
    timeLeft,
  });

  const {
    closeSubmitConfirm,
    confirmSubmitExam,
    handleSubmitRef,
    requestSubmitExam,
  } = useExamSubmission({
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
  });

  useExamCountdown({
    endTimeRef,
    handleSubmitRef,
    isDraftReady,
    setTimeLeft,
    timeLeft,
  });

  useExamDraftPersistence({
    currentQuestionIndex,
    endTimeRef,
    examDraftKey,
    examId,
    isDraftReady,
    selectedAnswers,
    startTime,
    subjectId,
    userExamId,
  });

  useExamProgressAutosave({
    currentQuestionIndex,
    isDraftReady,
    timeLeft,
    userExamId,
  });

  useEffect(() => {
    typesetMath();
  }, [currentQuestionIndex, questions]);

  const { handleAnswerSelect } = useExamAnswerAutosave({
    currentQuestionIndex,
    questions,
    setSelectedAnswers,
    timeLeft,
    userExamId,
  });

  return {
    answeredCount,
    closeSubmitConfirm,
    confirmSubmitExam,
    currentQuestion,
    currentQuestionIndex,
    goToNextQuestion: () =>
      setCurrentQuestionIndex((prev) =>
        getNextQuestionIndex(prev, questions.length)
      ),
    goToPreviousQuestion: () =>
      setCurrentQuestionIndex(getPreviousQuestionIndex),
    handleAnswerSelect,
    hours,
    isLoading,
    isSubmitting,
    isSubmitConfirmOpen,
    minutes,
    navigate,
    requestSubmitExam,
    progressPercent,
    questions,
    seconds,
    selectedAnswers,
    setCurrentQuestionIndex,
    subjectId,
    subjectName,
    texts,
    title,
  };
};

