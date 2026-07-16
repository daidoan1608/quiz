import { authAxios, publicAxios } from "./axiosConfig";

const getResponseData = (response, fallback) => response?.data?.data ?? response?.data ?? fallback;

export const examApi = {
  getPublicExam(examId, params) {
    return authAxios.get(`public/exams/${examId}`, { params });
  },

  getExamAttempt(userExamId) {
    return authAxios.get(`user-exams/${userExamId}`);
  },

  startAttempt(payload) {
    return authAxios.post("exam-attempts/start", payload);
  },

  submitAttempt(userExamId) {
    return authAxios.post(`exam-attempts/${userExamId}/submit`);
  },

  submitUserExam(payload) {
    return authAxios.post("user-exams", payload);
  },

  updateProgress(userExamId, payload) {
    return authAxios.patch(`exam-attempts/${userExamId}/progress`, payload);
  },

  saveAnswer(userExamId, payload) {
    return authAxios.put(`exam-attempts/${userExamId}/answers`, payload);
  },

  getChapterQuestions(chapterId, params = { includeCorrectAnswers: true }) {
    return publicAxios
      .get(`/public/questions/chapter/${chapterId}`, { params })
      .then((response) => getResponseData(response, []));
  },

  getSmartWrongPracticeQuestions(params = { includeCorrectAnswers: true }) {
    return authAxios
      .get("/questions/practice/wrong", { params })
      .then((response) => getResponseData(response, []));
  },

  getRankings(config) {
    return publicAxios.get("/public/user-exam-summaries", config);
  },
};
