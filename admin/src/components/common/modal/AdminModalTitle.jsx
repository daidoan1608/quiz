import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

export default function AdminModalTitle({ children, icon }) {
  return (
    <Title className="admin-modal-title" level={4}>
      {icon && <span className="admin-modal-title__icon">{icon}</span>}
      {children}
    </Title>
  );
}
