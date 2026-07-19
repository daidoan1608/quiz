import { authAxios } from "../axiosConfig";

export const fetchNotificationRecipients = async (historyId) => {
  const response = await authAxios.get(`/admin/notifications/history/${historyId}/recipients`);
  return response.data.content || [];
};
