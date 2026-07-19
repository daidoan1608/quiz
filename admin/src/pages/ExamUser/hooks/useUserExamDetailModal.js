import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import {
  fetchExamQuestionsWithCorrectAnswers,
  fetchUserExamDetail,
} from "../../../api/services/userExamApi";
import { fetchUserProfile } from "../../../api/services/profileApi";

const getFallbackUserInfo = (detail) => {
  const userExam = detail.userExamDto || {};
  return {
    username: detail.username,
    fullName: detail.fullName,
    userId: userExam.userId,
  };
};

export const useUserExamDetailModal = ({ isModalOpen, userExamId }) => {
  const [examDetail, setExamDetail] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetDetail = useCallback(() => {
    setExamDetail(null);
    setExamQuestions([]);
    setUserInfo(null);
  }, []);

  const loadDetail = useCallback(async () => {
    if (!userExamId) return;

    try {
      setLoading(true);
      const detail = await fetchUserExamDetail(userExamId);
      const userExam = detail.userExamDto || {};

      setExamDetail(detail);
      setUserInfo(getFallbackUserInfo(detail));
      setExamQuestions(detail.questions || []);

      const [questionResult, userResult] = await Promise.allSettled([
        detail.questions?.length
          ? Promise.resolve(detail.questions)
          : fetchExamQuestionsWithCorrectAnswers({ examId: userExam.examId, userExamId }),
        userExam.userId ? fetchUserProfile(userExam.userId) : Promise.reject(),
      ]);

      if (questionResult.status === "fulfilled") {
        setExamQuestions(questionResult.value || []);
      }

      if (userResult.status === "fulfilled") {
        setUserInfo(userResult.value || {});
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết bài làm:", error);
      message.error("Không thể tải chi tiết bài làm.");
      resetDetail();
    } finally {
      setLoading(false);
    }
  }, [resetDetail, userExamId]);

  useEffect(() => {
    if (isModalOpen && userExamId) {
      loadDetail();
    } else {
      resetDetail();
    }
  }, [isModalOpen, loadDetail, resetDetail, userExamId]);

  return {
    examDetail,
    examQuestions,
    loading,
    userInfo,
  };
};
