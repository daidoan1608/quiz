import React, { useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../hooks/useTheme";
import { BsSun, BsMoon } from "react-icons/bs";
import "../../styles/contentHeader.css";
import { NotificationSidebar } from "./NotificationSidebar";
export const ContentHeader = ({
  texts = { login: "Đăng nhập", register: "Đăng ký" },
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toggleMenu = () => setMenuOpen(!menuOpen); // Hàm xử lý mở/đóng Notification Sidebar

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setMenuOpen(false); // Đảm bảo menu avatar đóng khi mở noti
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setMenuOpen(false);
  };

  return (
    <>
      <div className="content--header">
        <h1 className="header--title">VNUA Education Manager</h1>
        <div className="header--activity">
          <div className="notify" onClick={handleToggleNotifications}>
            <IoMdNotificationsOutline className="icon" />
          </div>
          <div className="avatar" onClick={toggleMenu}>
            <img
              src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"
              alt="Avatar"
              className="avatar-img"
            />
            {menuOpen && (
              <ul className="avatar-menu">
                {/* Mục Chuyển đổi Theme */}
                <li className="username">{localStorage.getItem("username")}</li>

                <li onClick={handleToggleTheme} className="theme-switcher-item">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>Chế độ: {theme === "light" ? "Sáng" : "Tối"}</span>
                    {theme === "light" ? (
                      <BsMoon size={16} />
                    ) : (
                      <BsSun size={16} />
                    )}
                  </div>
                </li>
                {/* Mục Đăng xuất */}
                <li onClick={handleLogout}>Đăng xuất</li>
              </ul>
            )}
          </div>
        </div>
      </div>
      <NotificationSidebar
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
