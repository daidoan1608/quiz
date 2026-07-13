import { authAxios } from "../axiosConfig";
import { normalizeList, unwrapApiData } from "./apiResponse";

export const userApi = {
  async getAll() {
    const response = await authAxios.get("/admin/users");
    return normalizeList(unwrapApiData(response));
  },

  async search(keyword) {
    const response = await authAxios.get("/admin/users/search", {
      params: { key: keyword },
    });
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
};
