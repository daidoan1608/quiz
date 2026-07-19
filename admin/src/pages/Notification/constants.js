import React from "react";
import {
  GlobalOutlined,
  ReadOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

export const NOTIFICATION_TEMPLATES = {
  GLOBAL: {
    icon: <GlobalOutlined />,
    label: "Toàn hệ thống",
    helper: "Hiển thị cho tất cả người dùng trong hệ thống.",
    accent: "#0f766e",
  },
  PERSONAL: {
    icon: <UserOutlined />,
    label: "Cá nhân",
    helper: "Gửi trực tiếp đến một người dùng cụ thể.",
    accent: "#7c3aed",
  },
  SUBJECT: {
    icon: <ReadOutlined />,
    label: "Theo môn học",
    helper: "Gửi cho nhóm người học thuộc một môn học.",
    accent: "#2563eb",
  },
  BATCH: {
    icon: <TeamOutlined />,
    label: "Danh sách",
    helper: "Chọn nhiều người nhận cho cùng một nội dung.",
    accent: "#c2410c",
  },
};

export const RECIPIENT_COLUMNS = [
  { title: "Tên sinh viên", dataIndex: "fullName" },
  { title: "Email", dataIndex: "email" },
  {
    title: "Trạng thái",
    dataIndex: "read",
    render: (isRead) =>
      isRead ? (
        <Tag color="success">Đã xem</Tag>
      ) : (
        <Tag color="default">Chưa xem</Tag>
      ),
  },
];
