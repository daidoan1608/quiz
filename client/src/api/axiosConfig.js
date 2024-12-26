import axios from 'axios'

const BASE_URL = "http://localhost:8080"; // Đổi thành URL backend của bạn

// Tạo instance cho các API cần gắn token
const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tạo instance cho các API không cần gắn token
const publicAxios = axios.create({
  baseURL: BASE_URL,
});

// Hàm lấy token từ localStorage hoặc state
const getAccessToken = () => localStorage.getItem("accessToken");

// Hàm làm mới token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    const response = await publicAxios.post("/auth/refresh", { refreshToken });
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    console.error("Refresh token failed", error);
    // Xử lý logout nếu cần
    throw error;
  }
};

// Interceptor để thêm token vào header
authAxios.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý token hết hạn
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      try {
        const newToken = await refreshToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return authAxios(error.config); // Gọi lại request
      } catch (err) {
        // Xử lý logout nếu cần
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export { authAxios, publicAxios };