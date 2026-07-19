import { authAxios } from "../axiosConfig";

export const fetchUserExamDetail = async (userExamId) => {
  const response = await authAxios.get(`/user-exams/${userExamId}`);
  return response.data.data;
};

export const fetchExamQuestionsWithCorrectAnswers = async ({ examId, userExamId }) => {
  const response = await authAxios.get(`/public/exams/${examId}`, {
    params: { includeCorrectAnswers: true, userExamId },
  });
  return response.data.data.questions || [];
};
