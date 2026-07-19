import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { examApi } from 'api/services/examApi';
import { useLanguage } from 'context/language/LanguageProvider';
import { typesetMath } from 'utils/typesetMath';
import { createExamDraftKey, getCurrentUserId } from 'utils/storage';
import {
  buildNextSelectedAnswers,
  countAnsweredQuestions,
} from 'pages/Subject/utils/answerSelection';
import { buildUserAnswerDtos } from '../utils/buildUserAnswerDtos';
import { buildSaveAnswerPayload } from '../utils/examAttemptAnswers';
import { useExamCountdown } from './useExamCountdown';
import { useExamDraftPersistence } from './useExamDraftPersistence';
import { useExamProgressAutosave } from './useExamProgressAutosave';
import { useLoadExamAttempt } from './useLoadExamAttempt';

export const useExamAttempt = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [userExamId, setUserExamId] = useState(null);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const endTimeRef = useRef(null);
  const handleSubmitRef = useRef(null);
  const userExamIdRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const examId = location.state?.examId || params.examId;
  const subjectId = location.state?.subjectId || params.subjectId;
  const userId = getCurrentUserId();
  const examDraftKey = createExamDraftKey(userId, examId);
  const { texts } = useLanguage();

  useEffect(() => {
    userExamIdRef.current = userExamId;
  }, [userExamId]);

  const handleSubmit = useCallback(async () => {
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
        if (examDraftKey) localStorage.removeItem(examDraftKey);
        message.success('Nộp bài thành công!');
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
      message.error(
        error.response?.status === 403
          ? 'Phiên đăng nhập hết hạn.'
          : 'Lỗi khi nộp bài.'
      );
    }
  }, [
    duration,
    examDraftKey,
    examId,
    navigate,
    questions,
    selectedAnswers,
    startTime,
    subjectId,
    timeLeft,
    userExamId,
    userId,
  ]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

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

  const saveAnswerToServer = useCallback(
    async (questionIndex, answerValue) => {
      const attemptId = userExamIdRef.current;
      const question = questions[questionIndex];
      if (!attemptId || !question) return;

      try {
        await examApi.saveAnswer(
          attemptId,
          buildSaveAnswerPayload({
            answerValue,
            question,
            questionIndex,
            remainingTime: timeLeft ?? 0,
          })
        );
      } catch (error) {
        console.error('Lỗi lưu đáp án:', error);
      }
    },
    [questions, timeLeft]
  );

  const handleAnswerSelect = (answerIndex) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    setSelectedAnswers((prev) => {
      const nextSelection = buildNextSelectedAnswers({
        answerIndex,
        currentQuestionIndex,
        previousAnswers: prev,
        question,
      });
      saveAnswerToServer(currentQuestionIndex, nextSelection.answerValue);
      return nextSelection.selectedAnswers;
    });
  };

  const safeTimeLeft = timeLeft ?? 0;
  const answeredCount = countAnsweredQuestions({ questions, selectedAnswers });

  return {
    answeredCount,
    closeSubmitConfirm: () => setIsSubmitConfirmOpen(false),
    confirmSubmitExam: () => {
      setIsSubmitConfirmOpen(false);
      handleSubmit();
    },
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    goToNextQuestion: () =>
      setCurrentQuestionIndex((prev) =>
        Math.min(questions.length - 1, prev + 1)
      ),
    goToPreviousQuestion: () =>
      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1)),
    handleAnswerSelect,
    hours: Math.floor(safeTimeLeft / 3600),
    isLoading,
    isSubmitConfirmOpen,
    minutes: Math.floor((safeTimeLeft % 3600) / 60),
    navigate,
    openSubmitConfirm: () => setIsSubmitConfirmOpen(true),
    progressPercent: questions.length
      ? (answeredCount / questions.length) * 100
      : 0,
    questions,
    seconds: safeTimeLeft % 60,
    selectedAnswers,
    setCurrentQuestionIndex,
    subjectId,
    subjectName,
    texts,
    title,
  };
};
