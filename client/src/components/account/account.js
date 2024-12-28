import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Account.css';
import { authAxios } from '../../api/axiosConfig';
import Headers from '../Headers';
import Footer from '../Footer';

const Account = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const response = await authAxios.get(`/${userId}`);
        if (mounted) {
          setUser(response.data);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          message.error('Lỗi khi lấy thông tin người dùng!');
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [isLoading, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };

  if (isLoading || !user) {
    return (
      <div>
        <Headers />
        <div className="account-container">
          <div className="account-info">
            <h2>Đang tải thông tin...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Headers />
      <div className="account-container">
        <div className="account-info">
          <h2>Thông tin người dùng</h2>
          <div className="account-details">
            <p><strong>Tên người dùng:</strong> {user.username}</p>
            <p><strong>Họ và tên:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
          <Button onClick={handleLogout} type="primary" danger>
            Đăng xuất
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;