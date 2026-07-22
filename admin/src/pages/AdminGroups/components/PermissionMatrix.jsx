import React from "react";
import { Checkbox, Space, Table, Typography } from "antd";

const { Text } = Typography;

export const PermissionMatrix = ({
  rows,
  actions,
  scopeType,
  scopeId = null,
  isChecked,
  setPermission,
}) => (
  <Table
    size="small"
    rowKey="resource"
    pagination={false}
    dataSource={rows}
    scroll={{ x: 860 }}
    columns={[
      {
        title: "Chức năng",
        dataIndex: "label",
        fixed: "left",
        width: 210,
        render: (label, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{label}</Text>
            <Text className="admin-table-caption" type="secondary">
              {record.resource}
            </Text>
          </Space>
        ),
      },
      ...actions.map((action) => ({
        title: action,
        key: action,
        width: 115,
        align: "center",
        render: (_, record) =>
          record.actions.includes(action) ? (
            <Checkbox
              checked={isChecked(scopeType, scopeId, record.resource, action)}
              onChange={(event) =>
                setPermission(
                  scopeType,
                  scopeId,
                  record.resource,
                  action,
                  event.target.checked
                )
              }
            />
          ) : (
            <Text type="secondary">-</Text>
          ),
      })),
    ]}
  />
);
