import React from "react";
import { Space, Typography } from "antd";

const { Text, Title } = Typography;

export default function AdminPageHeader({
  title,
  subtitle,
  actions,
  className,
}) {
  return (
    <div className={["admin-page-header", className].filter(Boolean).join(" ")}>
      <div className="admin-page-header__copy">
        <Title className="admin-page-header__title" level={2}>
          {title}
        </Title>
        {subtitle && (
          <Text className="admin-page-header__subtitle" type="secondary">
            {subtitle}
          </Text>
        )}
      </div>
      {actions && (
        <Space className="admin-page-header__actions" wrap>
          {actions}
        </Space>
      )}
    </div>
  );
}
