import { useState } from "react";
import {
  BiHome,
  BiMessage,
  BiBookOpen,
  BiStats,
  BiTask,
  BiUser,
  BiMenu,
  BiQuestionMark,
} from "react-icons/bi";
import { PiExam } from "react-icons/pi";
import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";


export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`menu ${isCollapsed ? "collapsed" : ""}`}>
      <div className="menu-header">
        <BiMenu className="menu-toggle-icon" onClick={toggleSidebar} />
      </div>

      <div className="menu--list">
        <NavLink
          to="/home"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <BiHome className="icon" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/admin/userexams"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <BiBookOpen className="icon" />
          <span>Quản lý bài thi</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <BiUser className="icon" />
          <span>Quản lý người dùng</span>
        </NavLink>

        <NavLink
          to="/admin/exams"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <PiExam className="icon" />
          <span>Quản lý đề thi</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <BiTask className="icon" />
          <span>Quản lý khoa</span>
        </NavLink>

        <NavLink
          to="/subjects"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <BiStats className="icon" />
          <span>Quản lý môn học</span>
        </NavLink>

        <NavLink
          to="/subject/chapters"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <BiMessage className="icon" />
          <span>Quản lý chương</span>
        </NavLink>

        <NavLink
          to="/chapter/questions"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
        >
          <BiQuestionMark className="icon" />
          <span>Quản lý câu hỏi</span>
        </NavLink>
      </div>
    </div>
  );
}
