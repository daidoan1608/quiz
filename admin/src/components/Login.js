import React, { useState } from "react";
import { publicAxios } from "../api/axiosConfig";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { useAuth } from "../context/AuthProvider";

function Login() {
  const { login } = useAuth(); // Lấy hàm login từ context
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await publicAxios.post("/auth/login", {
        username,
        password,
      });

      const { accessToken, refreshToken, userId } = response.data.data;
      if (response.data.data.role !== "ADMIN") {
        message.error("Bạn không có quyền truy cập!");
        return;
      }
      login(accessToken, refreshToken, userId);
      navigate("/home");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-header">Đăng nhập</h2>
        <input
          className="login-input"
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleLogin}>
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

export default Login;
