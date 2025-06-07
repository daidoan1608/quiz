import React, { useState } from "react";
import { BiNotification } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Context/AuthProvider"; 
import '../styles/contentHeader.css'

export const ContentHeader = ({ texts = { login: "Đăng nhập", register: "Đăng ký" } }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();           
    navigate("/login"); 
    setMenuOpen(false);
  };

  return (
    <div className="content--header">
      <h1 className="header--title">VNUA Education Manager</h1>
      <div className="header--activity">
        <div className="notify">
          <BiNotification className="icon" />
        </div>
        <div className="avatar" onClick={toggleMenu}>
          <img
            src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"
            alt="Avatar"
            className="avatar-img"
          />
          {menuOpen && (
            <ul className="avatar-menu">
              <li onClick={() => handleNavigate("/home")}>Home</li>
              <li onClick={() => handleNavigate("/admin/userexams")}>Quản lý bài thi user</li>
              <li onClick={() => handleNavigate("/admin/users")}>Quản lý user</li>
              <li onClick={() => handleNavigate("/admin/exams")}>Quản lý bài thi</li>
              <li onClick={() => handleNavigate("/subjects")}>Quản lý môn học</li>
              <li onClick={() => handleNavigate("/subject/chapters")}>Quản lý chương</li>
              <li onClick={() => handleNavigate("/chapter/questions")}>Quản lý câu hỏi</li>
              <li onClick={handleLogout}>Đăng xuất</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
