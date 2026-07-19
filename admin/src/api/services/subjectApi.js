import { authAxios } from "../axiosConfig";
import { normalizeList, unwrapApiData } from "./apiResponse";

export const subjectApi = {
  async getAll() {
    const response = await authAxios.get("/public/subjects");
    return normalizeList(unwrapApiData(response));
  },

  async getDeleted() {
    const response = await authAxios.get("/admin/subjects/deleted");
    return normalizeList(unwrapApiData(response));
  },

  async search(keyword) {
    const response = await authAxios.get("/public/subjects/search", {
      params: { q: keyword },
    });
    return normalizeList(unwrapApiData(response));
  },

  async filter(params) {
    const response = await authAxios.get("/admin/subjects/filter", { params });
    return normalizeList(unwrapApiData(response));
  },

  async getById(subjectId) {
    const response = await authAxios.get(`/public/subjects/${subjectId}`);
    return unwrapApiData(response, null);
  },

  async getByCategory(categoryId) {
    const response = await authAxios.get(`/public/subjects/category/${categoryId}`);
    return normalizeList(unwrapApiData(response));
  },

  create(payload) {
    return authAxios.post("/admin/subjects", payload);
  },

  update(subjectId, payload) {
    return authAxios.patch(`/admin/subjects/${subjectId}`, payload);
  },

  remove(subjectId) {
    return authAxios.delete(`/admin/subjects/${subjectId}`);
  },

  restore(subjectId) {
    return authAxios.patch(`/admin/subjects/${subjectId}/restore`);
  },
};
