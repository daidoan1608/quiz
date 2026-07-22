import React, { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import ContentRoutes from "../routes/ContentRoutes";
import { ContentHeader } from "../components/common/Header";
import { Layout } from "antd";

const { Header, Content } = Layout;

export default function Display() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <Layout className="admin-shell">
      <Sidebar
        mobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <Layout className="admin-main-layout">
        <Header className="admin-topbar">
          <ContentHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
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
