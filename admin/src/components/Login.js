import React, { useState } from 'react';
import axios from '../Api/userApi';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      const data = response.data;

      if (response.status === 200) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('userId', data.userId); // Lưu userId vào localStorage
        alert('Đăng nhập thành công!');
        navigate('/'); // Điều hướng đến trang quản lý user
      } else {
        alert(data.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Đăng nhập thất bại! Vui lòng thử lại.');
    }
  };

  return (
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
  );
}

export default Login;
