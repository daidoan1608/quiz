import React from "react";
import Sidebar from "../components/common/Sidebar";
import ContentRoutes from "./ContentRoutes";
import { ContentHeader } from "../components/common/Header";
import { Layout, theme } from "antd";
// Destructure các thành phần layout của Antd
const { Header, Content } = Layout;

export default function Display() {
  // Lấy token màu để set background động
  const { token } = theme.useToken();

  return (
    // Layout bao ngoài cùng: full màn hình
    <Layout style={{ minHeight: "100vh" }}>
      {/* 1. Sidebar nằm bên trái */}
      <Sidebar />

      {/* 2. Layout con bên phải (Chứa Header + Nội dung) */}
      <Layout>
        {/* Header của Antd: Set màu nền theo token, dính lên top */}
        <Header
          style={{
            padding: 0,
            background: token.colorBgContainer, // Tự động trắng hoặc đen xám
            position: "sticky",
            top: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {/* Nhúng ContentHeader cũ của bạn vào đây */}
          <div style={{ width: "100%" }}>
            <ContentHeader />
          </div>
        </Header>

        {/* Khu vực nội dung chính */}
        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: "100%", // Chiều cao tối thiểu
              background: token.colorBgContainer, // Nền khung nội dung
              borderRadius: token.borderRadiusLG, // Bo góc chuẩn
              color: token.colorText, // Màu chữ chuẩn
            }}
          >
            {/* Component chứa Routes của bạn */}
            <ContentRoutes />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
