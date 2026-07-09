import axios from "axios";
import { message } from "antd";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1/";

const config = {
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  sessionStorage.removeItem("refreshToken");
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

authAxios.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

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
      const refreshToken = sessionStorage.getItem("refreshToken");
      const response = await publicAxios.post("/auth/refresh", refreshToken ? { refreshToken } : undefined);
      const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
      }

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
