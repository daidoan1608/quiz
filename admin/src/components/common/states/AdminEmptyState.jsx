import React from "react";
import { Button, Card, Empty, Typography } from "antd";

const { Title } = Typography;

export default function AdminEmptyState({
  actionText,
  card = false,
  className,
  description,
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  onAction,
  title,
}) {
  const content = (
    <div className={["admin-state", "admin-state--empty", className].filter(Boolean).join(" ")}>
      {title ? <Title level={4}>{title}</Title> : null}
      <Empty image={image} description={description} />
      {actionText && onAction ? (
        <Button onClick={onAction}>{actionText}</Button>
      ) : null}
    </div>
  );

  if (card) {
    return <Card variant="borderless">{content}</Card>;
  }

  return content;
}
