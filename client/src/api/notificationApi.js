import { authAxios } from "./axiosConfig";

const getResponseData = (response, fallback) => response?.data?.data ?? response?.data ?? fallback;

export const notificationApi = {
  getAll() {
    return authAxios.get("/notifications").then((response) => getResponseData(response, []));
  },

  markOneRead(notificationId) {
    return authAxios.patch(`/notifications/${notificationId}`);
  },

  markAllRead() {
    return authAxios.patch("/notifications");
  },
};
