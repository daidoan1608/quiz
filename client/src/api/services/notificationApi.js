import { authAxios } from "../axiosConfig";
import { getResponseData } from './apiResponse';

export const notificationApi = {
  getAll() {
    return authAxios.get("/notifications").then((response) => getResponseData(response, []));
  },

  getUnreadCount() {
    return authAxios.get("/notifications/unread-count").then((response) => getResponseData(response, 0));
  },

  markOneRead(notificationId) {
    return authAxios.patch(`/notifications/${notificationId}`);
  },

  markAllRead() {
    return authAxios.patch("/notifications");
  },
};
