import { authAxios } from "../axiosConfig";
import { normalizeList, unwrapApiData } from "./apiResponse";

export const adminGroupApi = {
  async getAll() {
    const response = await authAxios.get("/admin/groups");
    return normalizeList(unwrapApiData(response));
  },

  async save(payload) {
    const response = await authAxios.post("/admin/groups", payload);
    return unwrapApiData(response, null);
  },

  remove(groupId) {
    return authAxios.delete(`/admin/groups/${groupId}`);
  },

  async getPermissions(groupId) {
    const response = await authAxios.get(`/admin/groups/${groupId}/permissions`);
    return normalizeList(unwrapApiData(response));
  },

  async savePermissions(groupId, permissions) {
    const response = await authAxios.put(`/admin/groups/${groupId}/permissions`, permissions);
    return normalizeList(unwrapApiData(response));
  },

  async getUserGroups(userId) {
    const response = await authAxios.get(`/admin/groups/users/${userId}`);
    return normalizeList(unwrapApiData(response));
  },

  assignUserGroups(userId, groupIds) {
    return authAxios.put(`/admin/groups/users/${userId}`, { groupIds });
  },
};
