import { useEffect, useMemo, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { examApi } from 'api/services/examApi';
import { getApiErrorMessage } from 'api/http/apiError';
import { typesetMath } from 'utils/typesetMath';
import { buildResultSummary } from 'pages/Subject/utils/examResultSummary';

export const useExamAttemptDetail = () => {
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const examId = location.state?.examId || searchParams.get('examId');
  const userExamId = location.state?.userExamId || params.userExamId;

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
        console.error('Lỗi tải chi tiết bài làm:', error.response || error);
        setError(getApiErrorMessage(error, 'Không thể tải chi tiết bài làm.'));
      } finally {
        setLoading(false);
      }
    };

    if (examId && userExamId) {
      fetchData();
    } else {
      setError('Missing exam info. Please start an exam first.');
      setLoading(false);
    }
  }, [examId, userExamId]);

  useEffect(() => {
    if (examData) typesetMath();
  }, [examData]);

  const summary = useMemo(
    () => buildResultSummary({ examData, userAnswers }),
    [examData, userAnswers]
  );

  return {
    error,
    examData,
    loading,
    navigate,
    summary,
    userAnswers,
  };
};
