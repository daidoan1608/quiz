import React, { useState } from "react";
import "./index.css";
import { useAuth } from "../Context/AuthProvider";
import { FaRegBookmark, FaBookmark } from "react-icons/fa"; // Icon yêu thích

export default function Headers() {
  const { isLoggedIn, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái mở modal
  const [bookmarkedExams, setBookmarkedExams] = useState([]); // Môn học yêu thích đã được bookmark

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleLogout = () => {
    logout();
  };

  // Hàm xử lý bookmark
  const handleBookmark = (subjectId) => {
    setBookmarkedExams((prevBookmarks) => {
      if (prevBookmarks.includes(subjectId)) {
        return prevBookmarks.filter((id) => id !== subjectId);
      } else {
        return [...prevBookmarks, subjectId];
      }
    });
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
                        <a
                          href="#"
                          className="bookmark"
                          onClick={toggleModal} // Mở modal khi nhấp vào yêu thích
                        >
                          Yêu thích
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

      {/* Modal hiển thị danh sách môn học yêu thích */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Môn học yêu thích</h3>
            <ul>
              {bookmarkedExams.length > 0 ? (
                bookmarkedExams.map((subjectId) => (
                  <li key={subjectId}>
                    {/* Hiển thị môn học yêu thích */}
                    <div>
                      Môn {subjectId} {/* Bạn có thể thay subjectId bằng tên môn học */}
                    </div>
                  </li>
                ))
              ) : (
                <p>Chưa có môn học yêu thích nào.</p>
              )}
            </ul>
            <button onClick={toggleModal}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
