import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useExamAttemptSummaryData } from 'pages/Subject/hooks/useExamAttemptSummaryData';

export const useExamResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const subjectId = location.state?.subjectId || params.subjectId;
  const examId = location.state?.examId || params.examId;
  const { totalQuestions } = location.state || {};
  const userExamId =
    location.state?.userExamId || searchParams.get('userExamId');
  const { error, examData, loading, summary, userAnswers } =
    useExamAttemptSummaryData({
      errorLogMessage: 'Lỗi tải kết quả bài thi:',
      examId,
      fallbackErrorMessage: 'Không thể tải dữ liệu kết quả.',
      missingInfoMessage:
        'Thiếu mã lần làm bài. Vui lòng mở kết quả từ lịch sử tài khoản hoặc sau khi nộp bài.',
      totalQuestions,
      userExamId,
    });

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
