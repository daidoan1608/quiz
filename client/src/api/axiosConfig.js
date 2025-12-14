import axios from "axios";

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
};

const authAxios = axios.create(config);
const publicAxios = axios.create(config);

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

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Kiểm tra lỗi 401 hoặc 403
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
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
        // Redirect về trang login
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { authAxios, publicAxios };
