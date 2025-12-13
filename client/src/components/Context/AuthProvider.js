import { message } from 'antd';
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userId');
    const userFullName = localStorage.getItem('fullName');
    const userAvatarUrl = localStorage.getItem('avatarUrl');
    if (token && userInfo) {
      setIsLoggedIn(true);
      setUser(userInfo);
      setFullName(userFullName || '');
      setAvatarUrl(userAvatarUrl || '');
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setFullName('');
      setAvatarUrl('');
    }
    setLoading(false);
  }, []);

  const login = (accessToken, refreshToken, userId, fullName, avatarUrl) => {
    localStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('avatarUrl', avatarUrl);
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
    localStorage.removeItem('avatarUrl');
    setIsLoggedIn(false);
    setUser(null);
    setFullName('');
    setAvatarUrl('');
    message.success('Đăng xuất thành công!');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, loading, fullName, avatarUrl }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
