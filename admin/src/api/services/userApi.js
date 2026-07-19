import { authAxios } from "../axiosConfig";
import { normalizeList, unwrapApiData } from "./apiResponse";

export const userApi = {
  async getAll() {
    const response = await authAxios.get("/admin/users");
    return normalizeList(unwrapApiData(response));
  },

  async getDeleted() {
    const response = await authAxios.get("/admin/users/deleted");
    return normalizeList(unwrapApiData(response));
  },

  async search(keyword, limit = 20) {
    const response = await authAxios.get("/admin/users/search", {
      params: { key: keyword, limit },
    });
    return normalizeList(unwrapApiData(response));
  },

  async filter(params) {
    const response = await authAxios.get("/admin/users/filter", { params });
    return normalizeList(unwrapApiData(response));
  },

  async getById(userId) {
    const response = await authAxios.get(`/users/${userId}`);
    return unwrapApiData(response, null);
  },

  create(payload) {
    return authAxios.post("/admin/users", payload);
  },

  remove(userId) {
    return authAxios.delete(`/admin/users/${userId}`);
  },

  restore(userId) {
    return authAxios.patch(`/admin/users/${userId}/restore`);
  },
};
