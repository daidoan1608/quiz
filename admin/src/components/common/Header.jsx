import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  theme as antTheme,
} from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const API_ROOT = (process.env.REACT_APP_API_URL || '/api/v1/').replace(
  /\/api\/v1\/?$/,
  ''
);

const resolveAvatarUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const ContentHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { mode, setMode, colorTheme, setColorTheme } = useTheme();
  const isDarkMode = mode === 'dark';
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { token } = antTheme.useToken();
  const username = localStorage.getItem('username') || 'Admin';
  const displayName = localStorage.getItem('fullName') || username;
  const avatarUrl = resolveAvatarUrl(localStorage.getItem('avatarUrl') || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const colorThemes = [
    { name: 'blue', color: '#137fec', label: 'Blue' },
    { name: 'emerald', color: '#10b981', label: 'Emerald' },
    { name: 'cyberpunk', color: '#ec4899', label: 'Pink' },
    { name: 'sunset', color: '#f97316', label: 'Orange' },
    { name: 'slate', color: '#6366f1', label: 'Indigo' },
  ];

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ cursor: 'default', padding: '6px 4px' }}>
          <Text strong>{displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
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
          style={{ padding: '8px 4px', width: 230 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text strong>Giao diện</Text>
            <Switch
              checked={isDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              onChange={(checked) => setMode(checked ? 'dark' : 'light')}
            />
          </div>

          <Text
            type="secondary"
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Màu chủ đạo
          </Text>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {colorThemes.map((themeOpt) => (
              <button
                key={themeOpt.name}
                onClick={() => setColorTheme(themeOpt.name)}
                title={themeOpt.label}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 12,
                  border:
                    colorTheme === themeOpt.name
                      ? `2px solid ${token.colorText}`
                      : `1px solid ${token.colorBorder}`,
                  background: themeOpt.color,
                  cursor: 'pointer',
                }}
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
          <Badge count={0} size="small">
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
            <Button type="text" style={{ height: 44, padding: '0 8px 0 6px' }}>
              <Space size={10}>
                <Avatar
                  src={avatarUrl || undefined}
                  icon={<UserOutlined />}
                  style={{ background: token.colorPrimary }}
                />
                <span style={{ fontWeight: 700 }}>{displayName}</span>
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </div>

      <NotificationSidebar
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
