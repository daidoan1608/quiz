import React from "react";
import { Button, Card, Space } from "antd";
import { DragOutlined } from "@ant-design/icons";

export function DashboardCard({
  title,
  extra,
  loading,
  children,
  dragHandleProps,
  isDragging,
}) {
  return (
    <Card
      title={title}
      extra={
        <Space size={8}>
          {extra}
          <Button
            aria-label={`Kéo thả ${typeof title === "string" ? title : "widget"}`}
            className="dashboard-drag-handle"
            icon={<DragOutlined />}
            size="small"
            type="text"
            {...dragHandleProps}
          />
        </Space>
      }
      variant="borderless"
      loading={loading}
      className={`modern-card dashboard-widget${isDragging ? " is-dragging" : ""}`}
    >
      {children}
    </Card>
  );
}
