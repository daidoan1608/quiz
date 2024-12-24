import React from 'react';
import './index.css'; // Nếu bạn có file CSS cho footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Thông tin liên hệ: cntt@vnua.edu.vn</p>
        <p>Điện thoại: (024) 62617701</p>
        <p>Địa chỉ: P316, Tầng 3 Nhà Hành chính, Học viện Nông nghiệp Việt Nam</p>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Bản quyền thuộc khoa CNTT Vnua.</p>
      </div>
    </footer>
  );
};

export default Footer;