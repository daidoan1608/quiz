import React, { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { NotificationSidebar } from './NotificationSidebar';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Space,
  Switch,
  Typography,
} from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ADMIN_API_ROOT } from '../../config/env';

const { Text } = Typography;

const resolveAvatarUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${ADMIN_API_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const ContentHeader = () => {
  const { logout } = useAuth();
  const { mode, setMode, colorTheme, setColorTheme } = useTheme();
  const isDarkMode = mode === 'dark';
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [adminAlertCount, setAdminAlertCount] = useState(0);
  const username = localStorage.getItem('username') || 'Admin';
  const displayName = localStorage.getItem('fullName') || username;
  const avatarUrl = resolveAvatarUrl(localStorage.getItem('avatarUrl') || '');

  const handleLogout = () => {
    logout();
  };

  const colorThemes = [
    { name: 'blue', label: 'Blue' },
    { name: 'emerald', label: 'Emerald' },
    { name: 'cyberpunk', label: 'Pink' },
    { name: 'sunset', label: 'Orange' },
    { name: 'slate', label: 'Indigo' },
  ];

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div className="admin-user-menu-info">
          <Text strong>{displayName}</Text>
          <br />
          <Text className="admin-user-menu-subtitle" type="secondary">
            Quản trị hệ thống
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'theme-controls',
      label: (
        <div
          className="admin-theme-menu"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="admin-theme-menu__row">
            <Text strong>Giao diện</Text>
            <Switch
              checked={isDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              onChange={(checked) => setMode(checked ? 'dark' : 'light')}
            />
          </div>

          <Text
            className="admin-theme-menu__label"
            type="secondary"
          >
            Màu chủ đạo
          </Text>
          <div className="admin-theme-swatches">
            {colorThemes.map((themeOpt) => (
              <button
                key={themeOpt.name}
                className={`admin-theme-swatch admin-theme-swatch--${themeOpt.name}${
                  colorTheme === themeOpt.name ? ' is-selected' : ''
                }`}
                onClick={() => setColorTheme(themeOpt.name)}
                title={themeOpt.label}
              />
            ))}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <div className="admin-header-inner">
        <div className="admin-header-title">
          <span className="admin-header-kicker">VNUA Quiz</span>
          <span className="admin-header-name">Systems Manager</span>
        </div>

        <Space size="middle">
          <Badge count={adminAlertCount} size="small">
            <Button
              type="text"
              shape="circle"
              icon={<BellOutlined />}
              onClick={() => setIsNotificationsOpen(true)}
            />
          </Badge>

          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            arrow
          >
            <Button className="admin-user-trigger" type="text">
              <Space size={10}>
                <Avatar
                  className="admin-user-avatar"
                  src={avatarUrl || undefined}
                  icon={<UserOutlined />}
                />
                <span className="admin-user-trigger__name">{displayName}</span>
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </div>

      <NotificationSidebar
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onCountChange={setAdminAlertCount}
      />
    </>
  );
};
