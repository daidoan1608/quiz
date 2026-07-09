import React from "react";
import Sidebar from "../components/common/Sidebar";
import ContentRoutes from "./ContentRoutes";
import { ContentHeader } from "../components/common/Header";
import { Layout } from "antd";

const { Header, Content } = Layout;

export default function Display() {
  return (
    <Layout className="admin-shell">
      <Sidebar />

      <Layout className="admin-main-layout">
        <Header className="admin-topbar">
          <ContentHeader />
        </Header>

        <Content className="admin-content">
          <div className="admin-content-card">
            <ContentRoutes />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
