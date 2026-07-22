import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useExamAttemptSummaryData } from 'pages/Subject/hooks/useExamAttemptSummaryData';

export const useExamAttemptDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const examId = location.state?.examId || searchParams.get('examId');
  const userExamId = location.state?.userExamId || params.userExamId;
  const { error, examData, loading, summary, userAnswers } =
    useExamAttemptSummaryData({
      errorLogMessage: 'Lỗi tải chi tiết bài làm:',
      examId,
      fallbackErrorMessage: 'Không thể tải chi tiết bài làm.',
      missingInfoMessage: 'Missing exam info. Please start an exam first.',
      userExamId,
    });

  return {
    error,
    examData,
    loading,
    navigate,
    summary,
    userAnswers,
  };
};
