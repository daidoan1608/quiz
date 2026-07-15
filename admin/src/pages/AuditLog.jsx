import React, { useCallback, useEffect, useState } from "react";
import { Space, Table, Tag, Typography, message } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import ManagementPageLayout from "../layouts/ManagementPageLayout";
import { auditLogApi } from "../api/services";

const { Text } = Typography;

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await auditLogApi.getLatest());
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tải audit log.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    { title: "Thời gian", dataIndex: "createdAt", width: 190, render: (value) => value ? new Date(value).toLocaleString() : "-" },
    { title: "Hành động", dataIndex: "action", width: 110, render: (value) => <Tag color={value === "DELETE" ? "red" : value === "UPDATE" ? "blue" : "green"}>{value}</Tag> },
    { title: "Đối tượng", key: "entity", width: 170, render: (_, record) => <Text>{record.entityType} #{record.entityId}</Text> },
    { title: "Người thực hiện", key: "actor", width: 220, render: (_, record) => <Text>{record.actorUsername || record.actorId || "System"}</Text> },
    { title: "Mô tả", dataIndex: "description", render: (value) => <Text ellipsis>{value || "-"}</Text> },
  ];

  return (
    <ManagementPageLayout
      title={<Space><HistoryOutlined /> Audit log</Space>}
      table={<Table columns={columns} dataSource={logs} rowKey="auditLogId" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />}
      onReload={fetchLogs}
    />
  );
}
