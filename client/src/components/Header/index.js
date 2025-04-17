import React from "react";
import "./index.css";
import { useAuth } from "../Context/AuthProvider";

export default function Headers() {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <header className="header">
      <div className="logo">
            <img alt="FITA logo" src="logoschool.png" />
          </div>
        <div className="header-top">
          
          <div className="header-between">
            <div className="slogan">
              <img alt="slogan" src="slogan-vi.png" />
            </div>
          </div>
          <div className="auth-links">
            <div className="header-img">
              <img alt="Illustration" src="hat.png" />
            </div>
            {!isLoggedIn ? (
              <>
                <a href="/login" className="login-btn">
                  Đăng nhập
                </a>
                <a href="/register" className="register-btn">
                  Đăng ký
                </a>
              </>
            ) : (
              <div className="user-info">
                <ul className="menu-user">
                  <li>
                    <input
                      type="checkbox"
                      id="menu-toggle"
                      className="menu-toggle"
                    />
                    <label htmlFor="menu-toggle">
                      <i className="fa-regular fa-user"></i>
                    </label>
                    <ul className="submenu-user">
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
        <div className="nav-links-headers2">
          <a href="/">TRANG CHỦ</a>
          <a href="/revision">ÔN TẬP</a>
          <a href="/chooseExams">BÀI THI</a>
          <a href="/rank">XẾP HẠNG</a>
        </div>
      </header>
    </div>
  );
}