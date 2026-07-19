import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { authAxios } from "../../../api/axiosConfig";

export const useUserExamDetailPage = (userExamId) => {
  const [examDetail, setExamDetail] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExamDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/user-exams/${userExamId}`);
      const detail = response.data.data;
      const userExam = detail.userExamDto || {};

      setExamDetail(detail);
      setUserInfo({
        username: detail.username,
        fullName: detail.fullName,
        userId: userExam.userId,
      });
      setExamQuestions(detail.questions || []);

      const [questionResult, userResult] = await Promise.allSettled([
        detail.questions && detail.questions.length > 0
          ? Promise.resolve({ data: { data: { questions: detail.questions } } })
          : authAxios.get(`/public/exams/${userExam.examId}`, {
              params: { includeCorrectAnswers: true, userExamId },
            }),
        authAxios.get(`/users/${userExam.userId}`),
      ]);

      if (questionResult.status === "fulfilled") {
        setExamQuestions(questionResult.value.data.data.questions || []);
      } else {
        message.error("Không thể tải danh sách câu hỏi.");
      }

      if (userResult.status === "fulfilled") {
        setUserInfo(userResult.value.data.data || {});
      } else {
        setUserInfo({
          userId: userExam.userId,
          username: detail.username || String(userExam.userId).slice(0, 8),
          fullName: detail.fullName || "Unknown",
        });
      }
    } catch (error) {
      message.error("Không thể tải chi tiết bài thi.");
    } finally {
      setLoading(false);
    }
  }, [userExamId]);

  useEffect(() => {
    fetchExamDetail();
  }, [fetchExamDetail]);

  const userAnswersByQuestion = useMemo(() => {
    const answerMap = new Map();
    (examDetail?.userAnswerDtos || []).forEach((answer) => {
      if (!answerMap.has(answer.questionId)) {
        answerMap.set(answer.questionId, new Set());
      }
      answerMap.get(answer.questionId).add(answer.answerId);
    });
    return answerMap;
  }, [examDetail]);

  return {
    examDetail,
    examQuestions,
    userInfo,
    userAnswersByQuestion,
    loading,
  };
};
