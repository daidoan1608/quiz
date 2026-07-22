import { useEffect, useMemo, useState } from 'react';
import { examApi } from 'api/services/examApi';
import { getApiErrorMessage } from 'api/http/apiError';
import { typesetMath } from 'utils/typesetMath';
import { buildResultSummary } from 'pages/Subject/utils/examResultSummary';

export const useExamAttemptSummaryData = ({
  examId,
  missingInfoMessage,
  totalQuestions,
  userExamId,
  errorLogMessage = 'Lỗi tải dữ liệu bài làm:',
  fallbackErrorMessage = 'Không thể tải dữ liệu bài làm.',
}) => {
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examResponse, userAnswersResponse] = await Promise.all([
          examApi.getPublicExam(examId, {
            includeCorrectAnswers: true,
            userExamId,
          }),
          examApi.getExamAttempt(userExamId),
        ]);
        setExamData(examResponse.data.data);
        setUserAnswers(userAnswersResponse.data.data);
      } catch (error) {
        console.error(errorLogMessage, error.response || error);
        setError(getApiErrorMessage(error, fallbackErrorMessage));
      } finally {
        setLoading(false);
      }
    };

    if (examId && userExamId) {
      fetchData();
    } else {
      setError(missingInfoMessage);
      setLoading(false);
    }
  }, [
    errorLogMessage,
    examId,
    fallbackErrorMessage,
    missingInfoMessage,
    userExamId,
  ]);

  useEffect(() => {
    if (examData) typesetMath();
  }, [examData]);

  const summary = useMemo(
    () => buildResultSummary({ examData, totalQuestions, userAnswers }),
    [examData, totalQuestions, userAnswers]
  );

  return {
    error,
    examData,
    loading,
    summary,
    userAnswers,
  };
};
