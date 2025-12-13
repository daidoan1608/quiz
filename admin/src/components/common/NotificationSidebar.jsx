import React from "react";
import { Drawer, List, Typography, Avatar, theme } from "antd";
import {
  BellOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export const NotificationSidebar = ({ isOpen, onClose }) => {
  // Lấy token màu để style text phụ (ngày giờ)
  const { token } = theme.useToken();

  // Giả lập dữ liệu thông báo (Sau này bạn có thể thay bằng props hoặc gọi API)
  const notifications = [
    {
      id: 1,
      title: "Kết quả bài thi mới",
      description: "Bạn vừa hoàn thành bài thi Java Basic với số điểm 9/10.",
      time: "5 phút trước",
      type: "exam",
    },
    {
      id: 2,
      title: "Môn học cập nhật",
      description:
        "Chương 3: OOP đã được thêm vào môn Lập trình hướng đối tượng.",
      time: "1 giờ trước",
      type: "course",
    },
    {
      id: 3,
      title: "Nhắc nhở ôn tập",
      description: "Đừng quên hoàn thành bài tập về nhà trước 12h đêm nay.",
      time: "2 giờ trước",
      type: "reminder",
    },
  ];

  return (
    <Drawer
      title="Thông báo"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={400}
      styles={{
        body: { padding: 0 },
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "16px 24px",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            // Hiệu ứng hover nhẹ (tùy chọn)
            className="notification-item-hover"
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<BellOutlined />}
                  style={{
                    backgroundColor:
                      item.type === "exam"
                        ? token.colorError
                        : token.colorPrimary,
                  }}
                />
              }
              title={
                <Text strong style={{ fontSize: 15 }}>
                  {item.title}
                </Text>
              }
              description={
                <div>
                  <div style={{ marginBottom: 4, color: token.colorText }}>
                    {item.description}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <ClockCircleOutlined
                      style={{
                        fontSize: 12,
                        color: token.colorTextDescription,
                      }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.time}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};
