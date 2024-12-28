import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../account/account.css';
import axiosLocalApi from '../../api/local-api';

const Account = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      message.error('Chưa đăng nhập!');
      navigate('/login');  // Redirect to login page if not logged in
    } else {
      // Check if user data is already in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);  // Set user data from localStorage
      } else {
        // Fetch user data from API if it's not in localStorage
        axiosLocalApi.get("/userId", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        })
        .then(response => {
          // Assuming the API returns user data in response.data
          setUser(response.data);  // Save fetched user data
          localStorage.setItem('user', JSON.stringify(response.data));  // Store in localStorage
        })
        .catch(error => {
          message.error('Lỗi khi lấy thông tin người dùng!');
        });
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    // Remove all user data and tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    message.success('Đăng xuất thành công!');
    navigate('/login');  // Redirect to login page after logout
  };

  if (!user) {
    return null;  // Return nothing if user data is not loaded yet
  }

  return (
    <div className="account-container">
      <div className="account-info">
        <h2>Thông tin người dùng</h2>
        <div className="account-details">
          <p><strong>Tên người dùng:</strong> {user.username}</p>
          <p><strong>Họ và tên:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        {/* <Button onClick={handleLogout} type="primary" danger>
          Đăng xuất
        </Button> */}
      </div>
    </div>
  );
};

export default Account;
