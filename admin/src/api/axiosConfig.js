import axios from "axios";

// 1. SỬA QUAN TRỌNG: Lấy URL động từ biến môi trường
// Nếu không tìm thấy biến môi trường thì mới fallback về localhost (để phòng hờ)
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1/";

// 2. Cấu hình chung
const config = {
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // QUAN TRỌNG: Để trình duyệt gửi Cookie
};

const authAxios = axios.create(config);
const publicAxios = axios.create(config);

let isRefreshing = false;
let failedQueue = [];

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

// 3. Response Interceptor
authAxios.interceptors.response.use(
  (response) => {
    // Mẹo nhỏ: Bạn có thể return response.data ở đây để code trong component gọn hơn
    // Nhưng nếu giữ nguyên response thì component phải gọi res.data
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Kiểm tra cả 401 (Unauthorized) và 403 (Forbidden)
    // Vì đôi khi Spring Security trả 403 khi Token hết hạn hoặc không hợp lệ
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
        // Gọi API Refresh (Cookie tự bay theo)
        await publicAxios.post("/auth/refresh");

        processQueue(null);
        return authAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // --- XỬ LÝ LOGOUT KHI REFRESH THẤT BẠI ---
        // Bạn nên dispatch 1 action Redux/Context để clear user info
        // Hoặc redirect cứng về trang login
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
