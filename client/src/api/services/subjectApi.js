import { authAxios, publicAxios } from "../axiosConfig";
import { getResponseData, normalizeList } from './apiResponse';

export const subjectApi = {
  getPublicSubjects() {
    return publicAxios
      .get("/public/subjects")
      .then((response) => normalizeList(getResponseData(response, [])));
  },

  getRandomPublicSubjects(limit = 4) {
    return publicAxios
      .get("/public/subjects/random", { params: { limit } })
      .then((response) => normalizeList(getResponseData(response, [])));
  },

  getPublicCategories() {
    return publicAxios
      .get("/public/categories")
      .then((response) => normalizeList(getResponseData(response, [])));
  },

  getPublicSubject(subjectId) {
    return publicAxios.get(`public/subjects/${subjectId}`).then((response) => getResponseData(response, null));
  },

  getInProgressAttempts(userId) {
    if (!userId) return Promise.resolve([]);
    return authAxios
      .get(`users/${userId}/exam-attempts/in-progress`)
      .then((response) => normalizeList(getResponseData(response, [])));
  },
};
