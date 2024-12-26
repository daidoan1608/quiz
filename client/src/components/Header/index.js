import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Headers() {
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
    publicAxios.post("/auth/logout", {
      refreshToken: localStorage.getItem("refreshToken"),
    });
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  return (
    <div>
      <header className="header">
        <img alt="FITA logo" src="logoschool.png" />
        <div>
          <div className="search-bar">
            <input placeholder="Tìm kiếm..." type="text" />
            <i className="fas fa-search"></i>
          </div>

          <div className="nav-links">
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
              <button onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
