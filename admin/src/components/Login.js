import React, { useState } from 'react';
import { publicAxios } from "../Api/axiosConfig";
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useAuth } from './Context/AuthProvider';

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Lấy hàm login từ context
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await publicAxios.post("/auth/login", {
        username,
        password,
      });

      const { accessToken, refreshToken, userId } = response.data;
      if(response.data.role !== 'ADMIN') {
        message.error('Bạn không có quyền truy cập!');
        return;
      }
      login(accessToken, refreshToken, userId);
      navigate("/home");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
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
      <button className="login-button" onClick={handleLogin}>Đăng nhập</button>
    </div>
    </div>
  );
}

export default Login;
