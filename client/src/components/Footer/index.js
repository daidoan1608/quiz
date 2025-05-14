import React from 'react';
import './index.css'; // Nếu bạn có file CSS cho footer

const Footer = () => {
  return (
    <footer className="footer mt-5 pt-4" style={{ backgroundColor: '#000', color: '#f5f5f5' }}>
      <div className="container-fluid">
        {/* Nội dung footer */}
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <p style={{ fontSize: '2vw' }}>
              Thông tin liên hệ: cntt@vnua.edu.vn
            </p>
            <p style={{ fontSize: '2vw' }}>
              Điện thoại: (024) 62617701
            </p>
            <p style={{ fontSize: '2vw' }}>
              Địa chỉ: P316, Tầng 3 Nhà Hành chính, Học viện Nông nghiệp Việt Nam
            </p>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom text-center mt-4">
          <p style={{ fontSize: '1.8vw' }}>
            &copy; {new Date().getFullYear()} Bản quyền thuộc khoa CNTT Vnua.
          </p>
        </div>
      </div>
    </footer>


  );
};

export default Footer;