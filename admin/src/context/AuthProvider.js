import { message } from "antd";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthStorage } from "../api/axiosConfig";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userInfo = localStorage.getItem("userId");
    if (token && userInfo) {
      setIsLoggedIn(true);
      setUser(userInfo);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken, userId, role, username) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userId);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    setIsLoggedIn(true);
    setUser(userId);
    navigate("/", { replace: true });
  };

  const logout = async () => {
    try {
      const { publicAxios } = await import("../api/axiosConfig");
      await publicAxios.post("/auth/logout");
    } catch (error) {
      // Vẫn xóa session phía client nếu server logout thất bại hoặc token đã hết hạn.
    } finally {
      clearAuthStorage();
      setIsLoggedIn(false);
      setUser(null);
      message.success("Đăng xuất thành công!");
      navigate("/login", { replace: true });
    }
  };

  const clearSession = () => {
    clearAuthStorage();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, clearSession, user }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
