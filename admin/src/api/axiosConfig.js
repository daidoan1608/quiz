import axios from "axios";
import { message } from "antd";

const BASE_URL = process.env.REACT_APP_API_URL || "/api/v1/";

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

const getCookieValue = (name) => {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1] || "") : "";
};

const isUnsafeMethod = (method = "get") =>
  ["post", "put", "patch", "delete"].includes(method.toLowerCase());

const attachCsrfHeader = (requestConfig) => {
  requestConfig.headers = requestConfig.headers || {};
  const xsrfToken = getCookieValue("XSRF-TOKEN");
  if (xsrfToken && isUnsafeMethod(requestConfig.method)) {
    requestConfig.headers["X-XSRF-TOKEN"] = xsrfToken;
  }
  return requestConfig;
};

authAxios.interceptors.request.use(attachCsrfHeader);
publicAxios.interceptors.request.use(attachCsrfHeader);

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
  localStorage.removeItem("fullName");
};

const ADMIN_BASENAME = process.env.REACT_APP_ADMIN_BASENAME || "/";

const getAdminLoginPath = () => {
  const basename = ADMIN_BASENAME === "/" ? "" : ADMIN_BASENAME.replace(/\/$/, "");
  return `${basename}/login`;
};

const redirectToLoginOnce = () => {
  clearAuthStorage();

  const loginPath = getAdminLoginPath();
  if (window.location.pathname !== loginPath) {
    window.location.replace(loginPath);
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

const primeCsrfToken = async () => {
  await publicAxios.get("/auth/me");
  return getCookieValue("XSRF-TOKEN");
};

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status === 403 && isUnsafeMethod(originalRequest.method) && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      try {
        const xsrfToken = await primeCsrfToken();
        if (xsrfToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["X-XSRF-TOKEN"] = xsrfToken;
          return authAxios(originalRequest);
        }
      } catch (csrfError) {
        return Promise.reject(error);
      }
    }

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
