import React from "react";
import { Card, Skeleton, Spin } from "antd";

export default function AdminLoadingState({
  card = false,
  className,
  rows = 6,
  size,
  skeleton = false,
  text = "Đang tải...",
}) {
  const content = skeleton ? (
    <Skeleton active paragraph={{ rows }} />
  ) : (
    <Spin size={size}>
      <span>{text}</span>
    </Spin>
  );

  if (card) {
    return (
      <Card variant="borderless">
        {content}
      </Card>
    );
  }

  return (
    <div className={["admin-state", "admin-state--loading", className].filter(Boolean).join(" ")}>
      {content}
    </div>
  );
}
