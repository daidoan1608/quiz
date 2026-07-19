import { authAxios } from "../axiosConfig";
import { normalizeList, unwrapApiData } from "./apiResponse";

export const categoryApi = {
  async getAll() {
    const response = await authAxios.get("/public/categories");
    return normalizeList(unwrapApiData(response));
  },

  async getDeleted() {
    const response = await authAxios.get("/admin/categories/deleted");
    return normalizeList(unwrapApiData(response));
  },

  async search(keyword) {
    const response = await authAxios.get("/public/categories/search", {
      params: { q: keyword },
    });
    return normalizeList(unwrapApiData(response));
  },

  async filter(params) {
    const response = await authAxios.get("/admin/categories/filter", { params });
    return normalizeList(unwrapApiData(response));
  },

  async getById(categoryId) {
    const response = await authAxios.get(`/admin/categories/${categoryId}`);
    return unwrapApiData(response, null);
  },

  create(payload) {
    return authAxios.post("/admin/categories", payload);
  },

  update(categoryId, payload) {
    return authAxios.put(`/admin/categories/${categoryId}`, payload);
  },

  remove(categoryId) {
    return authAxios.delete(`/admin/categories/${categoryId}`);
  },

  restore(categoryId) {
    return authAxios.patch(`/admin/categories/${categoryId}/restore`);
  },
};
