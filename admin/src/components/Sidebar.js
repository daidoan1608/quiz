import React from "react";
import {
  BiHome,
  BiLogOut,
  BiMessage,
  BiSolidReport,
  BiStats,
  BiTask,
  BiUser,
} from "react-icons/bi";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { useAuth } from "./Context/AuthProvider";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="menu">
      <div className="logo">
        <BiUser className="logo-icon" />
        <h2>Admin</h2>
      </div>

      <div className="menu--list">
        <NavLink to="/home" className="item">
          <BiHome className="icon" />
          Home
        </NavLink>
        <NavLink to="/admin/users" className="item">
          <BiTask className="icon" />
          Quản lý user
        </NavLink>
        <NavLink to="/admin/exams" className="item">
          <BiSolidReport className="icon" />
          Quản lý bài thi
        </NavLink>
        <NavLink to="/subjects" className="item">
          <BiStats className="icon" />
          Quản lý môn học
        </NavLink>
        <NavLink to="/subject/chapters" className="item">
          <BiMessage className="icon" />
          Quản lý chương
        </NavLink>
        <NavLink to="/chapter/questions" className="item">
          <BiMessage className="icon" />
          Quản lý câu hỏi
        </NavLink>
        <div onClick={handleLogout} className="item logout">
          <BiLogOut className="icon" />
          Đăng xuất
        </div>
      </div>
    </div>
  );
}
