import { authAxios } from "./axiosConfig";

const getResponseData = (response, fallback) => response?.data?.data ?? response?.data ?? fallback;

export const favoriteApi = {
  getByUser(userId) {
    return authAxios.get(`/users/${userId}/favorites`).then((response) => getResponseData(response, []));
  },

  add(payload) {
    return authAxios.post("/favorites", payload);
  },

  remove(payload) {
    return authAxios.delete("/favorites", { data: payload });
  },
};
