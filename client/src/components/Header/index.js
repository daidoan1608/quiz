import React from "react";
import "./index.css";
import { useAuth } from "../Context/AuthProvider";

export default function Headers() {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="header-container">
      <header className="header" style={{ marginTop: '10px' }}>

        <div className="d-flex justify-content-between align-items-center">
          <div className="logo">
            <img alt="FITA logo" src="logoschool.png" className="img-fluid" />
          </div>
          <div className="header-top d-flex align-items-center">
            <div className="header-between">
              <div className="slogan">
                <img alt="slogan" src="slogan-vi.png" className="img-fluid" />
              </div>
            </div>
            <div className="auth-links d-flex align-items-center">
              <div className="header-img">
                <img alt="Illustration" src="hat.png" className="img-fluid" />
              </div>
              {!isLoggedIn ? (
                <>
                  <a href="/login" className="btn btn-primary mx-2">
                    Đăng nhập
                  </a>
                  <a href="/register" className="btn btn-secondary mx-2">
                    Đăng ký
                  </a>
                </>
              ) : (
                <div className="user-info">
                  <ul className="menu-user list-unstyled">
                    <li>
                      <input
                        type="checkbox"
                        id="menu-toggle"
                        className="menu-toggle"
                      />
                      <label htmlFor="menu-toggle">
                        <i className="fa-regular fa-user"></i>
                      </label>
                      <ul className="submenu-user list-unstyled">
                        <li>
                          <a href="/account" className="account">
                            Tài khoản
                          </a>
                        </li>
                        <li>
                          <a href="/" onClick={handleLogout} className="log-out">
                            Đăng xuất
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="nav-links-headers2 d-flex justify-content-center my-3">
          <a href="/" className="mx-3">TRANG CHỦ</a>
          <a href="/revision" className="mx-3">ÔN TẬP</a>
          <a href="/chooseExams" className="mx-3">BÀI THI</a>
          <a href="/rank" className="mx-3">XẾP HẠNG</a>
          <a href="/favorites" className="favorites-link mx-3">
            <i className="fa-solid fa-heart"></i>
          </a>
        </div>
      </header>
    </div>
  );
}