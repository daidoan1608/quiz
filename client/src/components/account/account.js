import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../account/account.css';

const Account = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra thông tin người dùng trong localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));  // Chuyển đổi dữ liệu từ JSON
    } else {
      message.error('Chưa đăng nhập!');
      navigate('/login');  // Điều hướng tới trang login nếu chưa đăng nhập
    }
  }, [navigate]);

  const handleLogout = () => {
    // Xóa thông tin đăng nhập khi người dùng đăng xuất
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    message.success('Đăng xuất thành công!');
    navigate('/login');  // Điều hướng lại đến trang đăng nhập
  };

  if (!user) {
    return null; // Nếu không có người dùng, không hiển thị gì
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
        <Button 
          type="primary" 
          onClick={handleLogout} 
          size="large" 
          className="logout-button"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default Account;
