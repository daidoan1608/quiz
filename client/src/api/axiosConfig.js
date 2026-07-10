import axios from "axios";
import { message } from "antd";

// 1. Dùng process.env vì là Create React App
const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1/";

// 2. Cấu hình chung
const config = {
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // QUAN TRỌNG: Để gửi Cookie đi
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

// Hàm xử lý hàng đợi
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

// 3. Response Interceptor (Logic Refresh Token)
authAxios.interceptors.response.use(
  (response) => {
    // Trả về response.data để component đỡ phải gọi .data lần nữa (tùy thói quen của bạn)
    // Nếu Admin đang return response thì ở đây cũng nên return response cho đồng bộ
    return response;
  },
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

    // Kiểm tra lỗi 401 để refresh phiên đăng nhập
    if (status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return authAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API Refresh (Cookie HttpOnly sẽ tự động gửi đi)
        await publicAxios.post("/auth/refresh");

        // Refresh xong thì chạy lại các request đang chờ
        processQueue(null);

        // Gọi lại request ban đầu
        return authAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // Xử lý khi refresh thất bại (Token hết hạn)
        message.error(getApiErrorMessage(refreshError, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!"));
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { authAxios, publicAxios, getApiErrorMessage };
