import React, { useState } from "react";
import {
  BiHome,
  BiLogOut,
  BiMessage,
  BiSolidReport,
  BiStats,
  BiTask,
  BiUser,
  BiMenu,
  BiQuestionMark
} from "react-icons/bi";
import { PiExam } from "react-icons/pi";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { useAuth } from "./Context/AuthProvider";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`menu ${isCollapsed ? "collapsed" : ""}`}>
      <div className="menu-header">
        <BiMenu className="menu-toggle-icon" onClick={toggleSidebar} />
      </div>

      <div className="menu--list">
        <NavLink to="/home" className="item">
          <BiHome className="icon" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/admin/users" className="item">
          <BiUser className="icon" />
          <span>Quản lý user</span>
        </NavLink>
        <NavLink to="/admin/exams" className="item">
          <PiExam className="icon" />
          <span>Quản lý bài thi</span>
        </NavLink>
        <NavLink to="/subjects" className="item">
          <BiStats className="icon" />
          <span>Quản lý môn học</span>
        </NavLink>
        <NavLink to="/subject/chapters" className="item">
          <BiMessage className="icon" />
          <span>Quản lý chương</span>
        </NavLink>
        <NavLink to="/chapter/questions" className="item">
          <BiQuestionMark className="icon" />
          <span>Quản lý câu hỏi</span>
        </NavLink>
        <div onClick={handleLogout} className="item logout">
          <BiLogOut className="icon" />
          <span>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
}
