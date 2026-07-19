import { authAxios, publicAxios } from "../axiosConfig";
import { getResponseData } from './apiResponse';

export const authApi = {
  getCurrentUser() {
    return publicAxios.get("/auth/me").then((response) => getResponseData(response, null));
  },

  refreshSession() {
    return publicAxios.post("/auth/refresh");
  },

  login(payload) {
    return publicAxios.post("/auth/login", payload);
  },

  loginData(payload) {
    return publicAxios.post("/auth/login", payload).then((response) => getResponseData(response, null));
  },

  logout() {
    return publicAxios.post("/auth/logout");
  },

  register(payload) {
    return publicAxios.post("/auth/register", payload);
  },

  verifyEmail(token) {
    return publicAxios.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },

  requestPasswordReset(url, data) {
    return publicAxios.post(url, data);
  },

  loginWithProvider(provider) {
    return publicAxios.post(`/auth/${provider}`);
  },

  loginWithGoogle(idToken) {
    return publicAxios.post("/auth/google", { idToken }).then((response) => getResponseData(response, null));
  },

  getMyAvatar() {
    return authAxios.get("users/me/avatar");
  },
};
