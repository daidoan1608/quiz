import { authAxios } from "../axiosConfig";
import { normalizeList, unwrapApiData } from "./apiResponse";

export const chapterApi = {
  async getAll() {
    const response = await authAxios.get("/public/chapters");
    return normalizeList(unwrapApiData(response));
  },

  async search(keyword) {
    const response = await authAxios.get("/public/chapters/search", {
      params: { q: keyword },
    });
    return normalizeList(unwrapApiData(response));
  },

  async filter(params) {
    const response = await authAxios.get("/admin/chapters/filter", { params });
    return normalizeList(unwrapApiData(response));
  },

  async getBySubject(subjectId) {
    const response = await authAxios.get(`/public/chapters/subject/${subjectId}`);
    return normalizeList(unwrapApiData(response));
  },

  async getDeleted() {
    const response = await authAxios.get("/admin/chapters/deleted");
    return normalizeList(unwrapApiData(response));
  },

  remove(chapterId) {
    return authAxios.delete(`/admin/chapters/${chapterId}`);
  },

  restore(chapterId) {
    return authAxios.patch(`/admin/chapters/${chapterId}/restore`);
  },
};

export const examApi = {
  async getAll() {
    const response = await authAxios.get("/admin/exams");
    return normalizeList(unwrapApiData(response));
  },

  async getDeleted() {
    const response = await authAxios.get("/admin/exams/deleted");
    return normalizeList(unwrapApiData(response));
  },

  async filter(params) {
    const response = await authAxios.get("/admin/exams/filter", { params });
    return normalizeList(unwrapApiData(response));
  },

  async getBySubject(subjectId) {
    const response = await authAxios.get(`/public/exams/subject/${subjectId}`);
    return normalizeList(unwrapApiData(response));
  },

  async filterPage(params) {
    const response = await authAxios.get("/admin/exams/page", { params });
    return unwrapApiData(response, { content: [], totalElements: 0 });
  },

  async getQuestionLimits(subjectId) {
    const response = await authAxios.get(`/admin/questions/total-questions/${subjectId}`);
    return unwrapApiData(response, {});
  },

  async getDetail(examId) {
    const response = await authAxios.get(
      `/public/exams/${examId}?includeCorrectAnswers=true`
    );
    return unwrapApiData(response, null);
  },

  create(payload) {
    return authAxios.post("/admin/exams", payload);
  },

  update(examId, payload) {
    return authAxios.put(`/admin/exams/${examId}`, payload);
  },

  remove(examId) {
    return authAxios.delete(`/admin/exams/${examId}`);
  },

  restore(examId) {
    return authAxios.patch(`/admin/exams/${examId}/restore`);
  },
};

export const questionApi = {
  async getAll() {
    const response = await authAxios.get("/admin/questions");
    return normalizeList(unwrapApiData(response));
  },

  async search(keyword) {
    const response = await authAxios.get("/admin/questions/search", {
      params: { q: keyword },
    });
    return normalizeList(unwrapApiData(response));
  },

  async getDeleted() {
    const response = await authAxios.get("/admin/questions/deleted");
    return normalizeList(unwrapApiData(response));
  },

  async filter(params) {
    const response = await authAxios.get("/admin/questions/filter", { params });
    return normalizeList(unwrapApiData(response));
  },

  async getBySubject(subjectId) {
    const response = await authAxios.get(`/admin/questions/subject/${subjectId}`);
    return normalizeList(unwrapApiData(response));
  },

  async filterPage(params) {
    const response = await authAxios.get("/admin/questions/page", { params });
    return unwrapApiData(response, { content: [], totalElements: 0 });
  },

  async getById(questionId) {
    const response = await authAxios.get(`/admin/questions/${questionId}`);
    return unwrapApiData(response, null);
  },

  create(payload) {
    return authAxios.post("/admin/questions", payload);
  },

  update(questionId, payload) {
    return authAxios.patch(`/admin/questions/${questionId}`, payload);
  },

  remove(questionId) {
    return authAxios.delete(`/admin/questions/${questionId}`);
  },

  restore(questionId) {
    return authAxios.patch(`/admin/questions/${questionId}/restore`);
  },
};
