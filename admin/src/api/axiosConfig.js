import axios from "axios";
import { message } from "antd";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1/";

const config = {
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
};

const authAxios = axios.create(config);
const publicAxios = axios.create(config);

const getApiErrorMessage = (error, fallback = "Có lỗi xảy ra, vui lòng thử lại!") => {
  const responseData = error?.response?.data;
  if (responseData?.message) return responseData.message;
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }
  if (typeof responseData === "string") return responseData;
  return error?.message || fallback;
};

let isRefreshing = false;
let failedQueue = [];

const clearAuthStorage = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
};

const redirectToLoginOnce = () => {
  clearAuthStorage();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status === 403) {
      message.error(getApiErrorMessage(error, "Bạn không có quyền thực hiện thao tác này!"));
      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => authAxios(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await publicAxios.post("/auth/refresh");

      processQueue(null);
      return authAxios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      message.error(getApiErrorMessage(refreshError, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!"));
      redirectToLoginOnce();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { authAxios, publicAxios, clearAuthStorage, getApiErrorMessage };
