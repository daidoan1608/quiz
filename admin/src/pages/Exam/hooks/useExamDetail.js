import { useCallback, useEffect, useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { authAxios, getApiErrorMessage } from "../../../api/axiosConfig";

export const useExamDetail = ({ examId, open }) => {
  const [examDetail, setExamDetail] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExamDetail = useCallback(async () => {
    if (!examId) return;

    setLoading(true);
    try {
      const response = await authAxios.get(
        `/public/exams/${examId}?includeCorrectAnswers=true`
      );
      const data = response.data.data;
      setExamDetail(data);
      setQuestions(data.questions || []);
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải chi tiết đề thi."));
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (open && examId) {
      fetchExamDetail();
      return;
    }

    setExamDetail(null);
    setQuestions([]);
  }, [examId, fetchExamDetail, open]);

  return {
    examDetail,
    questions,
    loading,
    reload: fetchExamDetail,
  };
};
