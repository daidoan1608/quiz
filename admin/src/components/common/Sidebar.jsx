import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Layout, Menu, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BookOutlined,
  MessageOutlined,
  HomeOutlined,
  ReadOutlined,
  UserOutlined,
  TableOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const items = [
  { key: '/', icon: <HomeOutlined />, label: 'Dashboard' },
  { key: '/notifications', icon: <MessageOutlined />, label: 'Thông báo' },
  { key: '/documents', icon: <FolderOpenOutlined />, label: 'Tài liệu' },
  { key: '/audit-logs', icon: <HistoryOutlined />, label: 'Audit log' },
  { key: '/userexams', icon: <ReadOutlined />, label: 'Bài thi' },
  { key: '/users', icon: <UserOutlined />, label: 'Người dùng' },
  { key: '/exams', icon: <FileTextOutlined />, label: 'Đề thi' },
  { key: '/categories', icon: <AppstoreOutlined />, label: 'Khoa' },
  { key: '/subjects', icon: <TableOutlined />, label: 'Môn học' },
  { key: '/chapters', icon: <BookOutlined />, label: 'Chương' },
  { key: '/questions', icon: <QuestionCircleOutlined />, label: 'Câu hỏi' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      theme={mode === 'dark' ? 'dark' : 'light'}
      width={270}
      className="admin-sidebar"
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        overflow: 'auto',
      }}
    >
      <div className="admin-sidebar-logo">
        {!collapsed && (
          <div className="admin-brand">
            <div className="admin-brand-mark">Q</div>
            <div className="admin-brand-text">
              <span className="admin-brand-title">VNUA Quiz</span>
              <span className="admin-brand-subtitle">Admin Panel</span>
            </div>
          </div>
        )}

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: 38, height: 38 }}
        />
      </div>

      <Menu
        theme={mode === 'dark' ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={items}
      />
    </Sider>
  );
}
