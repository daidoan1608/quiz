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

  remove(questionId) {
    return authAxios.delete(`/admin/questions/${questionId}`);
  },

  restore(questionId) {
    return authAxios.patch(`/admin/questions/${questionId}/restore`);
  },
};
