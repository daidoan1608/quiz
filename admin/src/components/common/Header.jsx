import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeContext";
import { NotificationSidebar } from "./NotificationSidebar";

// 1. Thêm import Switch
import {
  Dropdown,
  Space,
  Avatar,
  Typography,
  Button,
  theme as antTheme,
  Badge,
  Switch
} from "antd";

import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined
} from "@ant-design/icons";

// Import Icon mặt trăng/mặt trời để nhét vào Switch cho đẹp (tùy chọn)
import { BsSun, BsMoon } from "react-icons/bs";

const { Title, Text } = Typography;

export const ContentHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { token } = antTheme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 2. Cấu hình lại Menu Item
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ cursor: 'default', padding: '4px 0' }}>
          <Text strong>Xin chào, {localStorage.getItem("username") || "User"}</Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'theme',
      label: (
        // Dùng div bọc để dàn hàng ngang: Chữ bên trái - Switch bên phải
        // onClick e.stopPropagation() giúp menu không bị đóng khi click vào vùng này
        <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 160 }}
            onClick={(e) => e.stopPropagation()}
        >
          <span>Dark Mode</span>
          <Switch
            checked={theme === 'dark'} // Kiểm tra theme hiện tại để bật/tắt
            onChange={toggleTheme}     // Gọi hàm đổi theme khi gạt
            size="small"               // Switch nhỏ gọn cho menu
            checkedChildren={<BsMoon size={10} style={{ marginTop: 2 }}/>} // Icon khi bật
            unCheckedChildren={<BsSun size={10} style={{ marginTop: 2 }}/>} // Icon khi tắt
          />
        </div>
      ),
    },
    {
      type: 'divider',
    },
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
          padding: '0 16px'
        }}
      >
        <Title level={4} style={{ margin: 0, color: token.colorText }}>
          Systems Manager
        </Title>

        <Space size="large">
          <div onClick={() => setIsNotificationsOpen(true)}>
             <Badge count={0} size="small">
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 20 }} />}
                />
             </Badge>
          </div>

          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            arrow
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar
                src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"
                icon={<UserOutlined />}
                size="large"
                style={{ border: `1px solid ${token.colorBorderSecondary}` }}
              />
            </div>
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