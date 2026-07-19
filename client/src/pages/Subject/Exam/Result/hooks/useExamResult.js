import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { examApi } from 'api/services/examApi';
import { getApiErrorMessage } from 'api/http/apiError';
import { typesetMath } from 'utils/typesetMath';
import { buildResultSummary } from 'pages/Subject/utils/examResultSummary';

export const useExamResult = () => {
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const subjectId = location.state?.subjectId || params.subjectId;
  const examId = location.state?.examId || params.examId;
  const { userExamId, totalQuestions } = location.state || {};

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
        console.error('Lỗi tải kết quả bài thi:', error.response || error);
        setError(getApiErrorMessage(error, 'Không thể tải dữ liệu kết quả.'));
      } finally {
        setLoading(false);
      }
    };

    if (examId && userExamId) {
      fetchData();
    } else {
      setError('Thiếu thông tin bài kiểm tra.');
      setLoading(false);
    }
  }, [examId, userExamId]);

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
    examId,
    loading,
    navigate,
    subjectId,
    summary,
    userAnswers,
  };
};
