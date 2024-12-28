import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Headers2() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // Khởi tạo hook navigate

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/"); // Chuyển hướng về trang chủ khi đăng xuất
  };

  return (
    <div>
      <header className="header">
        <img alt="FITA logo" src="logoschool.png" />
        <div className="header-between">
          

          <div className="nav-links-headers2">
            <a href="/">TRANG CHỦ</a>
            <a href="/revision">ÔN TẬP</a>
            <a href="/chooseExams">BÀI THI</a>
          </div>
        </div>

        <div className="header-img">
          <img alt="Illustration" src="hat.png" />
        </div>

        <div className="auth-links">
          {!isLoggedIn ? (
            <>
              <a href="/login" className="login">
                Đăng nhập
              </a>
              <a href="/register" className="register">
                Đăng ký
              </a>
            </>
          ) : (
            <div>
              <h3 className="welcome">Xin chào</h3>
              <ul className="menu-user">
                <li>
                  {/* Checkbox điều khiển sự hiển thị của submenu */}
                  <input type="checkbox" id="menu-toggle" className="menu-toggle" />
                  <label htmlFor="menu-toggle">
                  <i class="fa-regular fa-user"></i>
                  </label>
                  <ul className="submenu-user">
                    <li>
                      <a href="#" className="account">Tài khoản</a>
                    </li>
                    <li>
                      <a onClick={handleLogout} className="log-out">Đăng xuất</a>
                    </li>
                  </ul>
                </li>
              </ul>

            </div>
          )}
        </div>
      </header>
    </div>
  );
}
{/* <button onClick={handleLogout} */}