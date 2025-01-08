import { message } from 'antd';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userId');
    if (token && userInfo) {
      setIsLoggedIn(true);
      setUser(userInfo);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken, userId) => {
    localStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    setIsLoggedIn(true);
    setUser(userId);
    message.success('Đăng nhập thành công!');
    navigate("/home");  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUser(null);
    message.success('Đăng xuất thành công!');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
