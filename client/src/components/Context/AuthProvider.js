import { message } from 'antd';
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userId');
    const userFullName = localStorage.getItem('fullName');
    if (token && userInfo) {
      setIsLoggedIn(true);
      setUser(userInfo);
      setFullName(userFullName || '');
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setFullName('');
    }
    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken, userId, fullName) => {
    localStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('fullName', fullName);
    setIsLoggedIn(true);
    setUser(userId);
    setFullName(fullName);
    message.success('Đăng nhập thành công!');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    setIsLoggedIn(false);
    setUser(null);
    setFullName('');
    message.success('Đăng xuất thành công!');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, loading, fullName }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
