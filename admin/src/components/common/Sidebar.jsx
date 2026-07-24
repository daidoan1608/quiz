import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Layout, Menu, Button, Drawer } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
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
  SafetyCertificateOutlined,
  TableOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { ADMIN_ROUTES } from '../../utils/adminNavigationPolicy';
import { adminDetailRoutes } from '../../routes/adminLayoutRoutes';

const { Sider } = Layout;

const items = [
  { key: '/', icon: <HomeOutlined />, label: 'Dashboard' },
  { key: '/notifications', icon: <MessageOutlined />, label: 'Thông báo' },
  { key: '/documents', icon: <FolderOpenOutlined />, label: 'Tài liệu' },
  { key: '/audit-logs', icon: <HistoryOutlined />, label: 'Audit log' },
  { key: '/userexams', icon: <ReadOutlined />, label: 'Bài thi' },
  { key: '/users', icon: <UserOutlined />, label: 'Người dùng' },
  { key: '/groups', icon: <SafetyCertificateOutlined />, label: 'Nhóm quyền' },
  { key: '/exams', icon: <FileTextOutlined />, label: 'Đề thi' },
  { key: '/categories', icon: <AppstoreOutlined />, label: 'Khoa' },
  { key: '/subjects', icon: <TableOutlined />, label: 'Môn học' },
  { key: '/chapters', icon: <BookOutlined />, label: 'Chương' },
  { key: '/questions', icon: <QuestionCircleOutlined />, label: 'Câu hỏi' },
];

const menuPermissions = Object.fromEntries(ADMIN_ROUTES.map((route) => [route.path, route.menu]));

const routePatternToRegExp = (pattern) => {
  const escapedPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\:[^/]+/g, "[^/]+");

  return new RegExp(`^${escapedPattern}$`);
};

const getSelectedMenuKey = (pathname) => {
  const detailRoute = adminDetailRoutes.find((route) =>
    routePatternToRegExp(route.path).test(pathname)
  );

  return detailRoute?.parentPath || pathname;
};

const useIsMobileSidebar = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (event) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};

const SidebarBrand = ({ collapsed = false, onToggle }) => (
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

    {onToggle && (
      <Button
        aria-label={collapsed ? 'Mở rộng menu điều hướng' : 'Thu gọn menu điều hướng'}
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        className="admin-sidebar-toggle"
      />
    )}
  </div>
);

const SidebarMenu = ({ items: menuItems, mode, onSelect, selectedMenuKey }) => (
  <Menu
    theme={mode === 'dark' ? 'dark' : 'light'}
    mode="inline"
    selectedKeys={[selectedMenuKey]}
    onClick={({ key }) => onSelect(key)}
    items={menuItems}
  />
);

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme();
  const { user, canMenu } = useAuth();
  const selectedMenuKey = getSelectedMenuKey(location.pathname);
  const isMobile = useIsMobileSidebar();

  const visibleItems = items.filter((item) => {
    if (user?.role !== 'MOD') return true;
    return canMenu(menuPermissions[item.key]);
  });

  const handleSelect = (key) => {
    navigate(key);
    onMobileClose?.();
  };

  if (isMobile) {
    return (
      <Drawer
        className="admin-mobile-sidebar-drawer"
        closeIcon={null}
        onClose={onMobileClose}
        open={mobileOpen}
        placement="left"
        styles={{ body: { padding: 0 } }}
        width={270}
      >
        <SidebarBrand />
        <SidebarMenu
          items={visibleItems}
          mode={mode}
          onSelect={handleSelect}
          selectedMenuKey={selectedMenuKey}
        />
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      theme={mode === 'dark' ? 'dark' : 'light'}
      width={270}
      className="admin-sidebar"
    >
      <SidebarBrand
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <SidebarMenu
        items={visibleItems}
        mode={mode}
        onSelect={handleSelect}
        selectedMenuKey={selectedMenuKey}
      />
    </Sider>
  );
}
