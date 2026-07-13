import { authAxios, publicAxios } from "./axiosConfig";

const getResponseData = (response, fallback) => response?.data?.data ?? response?.data ?? fallback;

export const subjectApi = {
  getPublicSubjects() {
    return publicAxios.get("/public/subjects").then((response) => getResponseData(response, []));
  },

  getPublicCategories() {
    return publicAxios.get("/public/categories").then((response) => getResponseData(response, []));
  },

  getPublicSubject(subjectId) {
    return publicAxios.get(`public/subjects/${subjectId}`).then((response) => getResponseData(response, null));
  },

  getInProgressAttempts(userId) {
    if (!userId) return Promise.resolve([]);
    return authAxios
      .get(`users/${userId}/exam-attempts/in-progress`)
      .then((response) => getResponseData(response, []));
  },
};
