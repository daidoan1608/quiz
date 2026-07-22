import React from "react";
import { Checkbox, Space, Tag, Typography } from "antd";

const { Text } = Typography;

export function UserGroupOptionCard({ group, permissionCount, selected }) {
  return (
    <div
      className={`user-group-option-card${selected ? " user-group-option-card--selected" : ""}`}
    >
      <Checkbox value={group.id}>
        <Space direction="vertical" size={2}>
          <Space wrap>
            <Text strong>{group.name}</Text>
            <Tag>{group.code}</Tag>
            {group.systemManaged && <Tag color="gold">SYSTEM</Tag>}
          </Space>
          <Text type="secondary">{group.description || "Không có mô tả"}</Text>
          <Text className="user-group-option-card__count" type="secondary">
            {permissionCount} quyền trong nhóm
          </Text>
        </Space>
      </Checkbox>
    </div>
  );
}
