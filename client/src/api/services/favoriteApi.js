import { authAxios } from "../axiosConfig";
import { getResponseData } from './apiResponse';

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
