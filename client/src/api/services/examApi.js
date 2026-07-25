import { authAxios, publicAxios } from "../axiosConfig";
import { getResponseData } from './apiResponse';

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

  /**
   * @deprecated Legacy submit flow. Prefer startAttempt, saveAnswer, and submitAttempt.
   */
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

  getSmartWrongPracticeQuestionCount(params = {}) {
    return authAxios
      .get("/questions/practice/wrong/count", { params })
      .then((response) =>
        getResponseData(response, { total: 0, wrongTotal: 0, practiceTotal: 0 })
      );
  },

  getRankings(config) {
    return publicAxios.get("/public/rankings", config);
  },
};
