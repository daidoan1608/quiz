import { authAxios } from "./axiosConfig";

const getResponseData = (response, fallback) => response?.data?.data ?? response?.data ?? fallback;

const extractAvatarUrl = (response) => {
  const data = getResponseData(response, {});
  return response?.data?.avatarUrl || data?.avatarUrl || (typeof data === "string" ? data : "");
};

export const accountApi = {
  async getOverview(userId) {
    const [userResponse, examsResponse, inProgressResponse] = await Promise.all([
      authAxios.get(`users/${userId}`),
      authAxios.get(`users/${userId}/user-exams`),
      authAxios.get(`users/${userId}/exam-attempts/in-progress`).catch(() => ({ data: { data: [] } })),
    ]);

    return {
      user: getResponseData(userResponse, {}),
      exams: getResponseData(examsResponse, []),
      inProgressAttempts: getResponseData(inProgressResponse, []),
    };
  },

  updateProfile(userId, payload) {
    return authAxios.patch(`users/${userId}`, payload).then((response) => getResponseData(response, payload));
  },

  changePassword(userId, values) {
    return authAxios.patch(`users/${userId}/password`, values).then((response) => getResponseData(response, response?.data));
  },

  uploadAvatar(formData) {
    return authAxios
      .put("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(extractAvatarUrl);
  },
};
