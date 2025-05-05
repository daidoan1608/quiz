import axios from 'axios';

const BASE_URL = "http://localhost:8080/api/v1/"; // Địa chỉ API của bạn

// Tạo instance axios với config mặc định
const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Hàm refresh token
const refreshToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem("refreshToken");
    const response = await publicAxios.post("/auth/refresh", { refreshToken });
    
    const { accessToken } = response.data.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    
    return accessToken;
  } catch (error) {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return Promise.reject(error);
  }
};

// Interceptor cho request - tự động thêm token vào header
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response - tự động refresh token khi gặp lỗi 401/403
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tránh lặp vô hạn
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Kiểm tra nếu lỗi 401 hoặc 403
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (isRefreshing) {
        // Nếu đang refresh token, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authAxios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authAxios(originalRequest); // Gọi lại request ban đầu với token mới
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { authAxios, publicAxios };