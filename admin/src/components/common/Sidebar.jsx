import React, { useState } from "react";
import { Layout, Menu, Button, theme } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
// Import icon menu chuẩn của Antd hoặc dùng icon cũ của bạn
import {
  MenuFoldOutlined, MenuUnfoldOutlined, FileTextOutlined, AppstoreOutlined,
  BookOutlined, MessageOutlined,
  // Thêm các icon mới của Ant Design
  HomeOutlined, ReadOutlined, UserOutlined, TableOutlined, QuestionCircleOutlined
} from "@ant-design/icons";

const { Sider } = Layout;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

const items = [
  { key: "/", icon: <HomeOutlined />, label: "Home" }, // Đã thay đổi
  { key: "/notifications", icon: <MessageOutlined />, label: "Quản lý thông báo" },
  { key: "/userexams", icon: <ReadOutlined />, label: "Quản lý bài thi" }, // Đã thay đổi
  { key: "/users", icon: <UserOutlined />, label: "Quản lý người dùng" }, // Đã thay đổi
  { key: "/exams", icon: <FileTextOutlined />, label: "Quản lý đề thi" },
  { key: "/categories", icon: <AppstoreOutlined />, label: "Quản lý khoa" },
  { key: "/subjects", icon: <TableOutlined />, label: "Quản lý môn học" }, // Đã thay đổi
  { key: "/chapters", icon: <BookOutlined />, label: "Quản lý chương" },
  { key: "/questions", icon: <QuestionCircleOutlined />, label: "Quản lý câu hỏi" }, // Đã thay đổi
];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      trigger={null}
      theme="light"
      width={250}
      style={{
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        overflow: "auto",
      }}
    >
      {/* 2. Khu vực Header của Sidebar (Chứa Logo + Nút Toggle) */}
      <div
        style={{
          height: 64, // Chiều cao chuẩn header
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between", // Căn chỉnh linh hoạt
          padding: "0 16px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: 16
        }}
      >
        {/* Tên ứng dụng (Ẩn khi thu nhỏ) */}
        {!collapsed && (
          <span
            style={{
              fontWeight: "bold",
              fontSize: 25,
              color: token.colorPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden"
            }}
          >
            VNUA Quiz
          </span>
        )}

        {/* Nút Toggle tự chế */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "20px",
            width: 32,
            height: 32,
            color: token.colorText,
          }}
        />
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={items}
        style={{ borderRight: 0 , fontSize: 16}}
      />
    </Sider>
  );
}