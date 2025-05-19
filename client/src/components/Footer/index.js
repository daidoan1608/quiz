import React from 'react';
import './index.css';

const Footer = () => {
  return (
    <footer className="footer">
      
        {/* Nội dung chính của footer */}
        <div className="footer-content text-center">
          <p>Thông tin liên hệ: cntt@vnua.edu.vn</p>
          <p>Điện thoại: (024) 62617701</p>
          <p>Địa chỉ: P316, Tầng 3 Nhà Hành chính, Học viện Nông nghiệp Việt Nam</p>

          {/* Liên kết mạng xã hội */}
          <div className="social-links">
            <a href="https://www.facebook.com/FITA.VNUA" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
          </div>
        </div>

        {/* Phần cuối */}
        <div className="footer-bottom text-center">
          <p>&copy; {new Date().getFullYear()} Bản quyền thuộc khoa CNTT Vnua.</p>
        </div>
    </footer>
  );
};

export default Footer;
