import React from "react";
import { Space, Table, Tag } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTableText from "../../../components/common/table/AdminTableText";

const actionColor = (value) => {
  if (value === "DELETE") return "red";
  if (value === "UPDATE") return "blue";
  return "green";
};

export const AuditLogView = ({ logs, loading, fetchLogs }) => {
  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      render: (value) => (value ? new Date(value).toLocaleString() : "-"),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 110,
      sorter: (a, b) =>
        String(a.action || "").localeCompare(String(b.action || "")),
      render: (value) => <Tag color={actionColor(value)}>{value}</Tag>,
    },
    {
      title: "Đối tượng",
      key: "entity",
      width: 190,
      ellipsis: true,
      sorter: (a, b) =>
        `${a.entityType || ""} ${a.entityId || ""}`.localeCompare(
          `${b.entityType || ""} ${b.entityId || ""}`
        ),
      render: (_, record) => (
        <AdminTableText>
          {record.entityType} #{record.entityId}
        </AdminTableText>
      ),
    },
    {
      title: "Người thực hiện",
      key: "actor",
      width: 220,
      ellipsis: true,
      sorter: (a, b) =>
        String(a.actorUsername || a.actorId || "System").localeCompare(
          String(b.actorUsername || b.actorId || "System")
        ),
      render: (_, record) => (
        <AdminTableText>
          {record.actorUsername || record.actorId || "System"}
        </AdminTableText>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 360,
      ellipsis: true,
      sorter: (a, b) =>
        String(a.description || "").localeCompare(String(b.description || "")),
      render: (value) => <AdminTableText>{value}</AdminTableText>,
    },
  ];

  return (
    <ManagementPageLayout
      title={
        <Space>
          <HistoryOutlined /> Audit log
        </Space>
      }
      table={
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="auditLogId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1070 }}
          tableLayout="fixed"
        />
      }
      onReload={fetchLogs}
    />
  );
};
