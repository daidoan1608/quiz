import React, { useState } from "react";
import { Descriptions, Modal, Space, Tag, Typography } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTable from "../../../components/common/table/AdminTable";
import AdminTableText from "../../../components/common/table/AdminTableText";

const { Paragraph, Text } = Typography;

const actionColor = (value) => {
  if (value === "DELETE") return "red";
  if (value === "UPDATE") return "blue";
  return "green";
};

export const AuditLogView = ({ logs, loading, fetchLogs }) => {
  const [selectedLog, setSelectedLog] = useState(null);

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
      width: 320,
      ellipsis: true,
      sorter: (a, b) =>
        String(a.description || "").localeCompare(String(b.description || "")),
      render: (value) => (
        <div className="audit-log-description-cell">
          <AdminTableText>{value}</AdminTableText>
        </div>
      ),
    },
  ];

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <HistoryOutlined /> Audit log
          </Space>
        }
        table={
          <AdminTable
            columns={columns}
            dataSource={logs}
            rowKey="auditLogId"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1030 }}
            onRow={(record) => ({
              onClick: () => setSelectedLog(record),
              style: { cursor: "pointer" },
            })}
          />
        }
        onReload={fetchLogs}
      />

      <Modal
        title="Chi tiết audit log"
        open={Boolean(selectedLog)}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        width={760}
      >
        {selectedLog && (
          <Descriptions column={1} size="middle">
            <Descriptions.Item label="Thời gian">
              {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Hành động">
              <Tag color={actionColor(selectedLog.action)}>{selectedLog.action || "-"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đối tượng">
              <Text>
                {selectedLog.entityType || "-"} #{selectedLog.entityId || "-"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              {selectedLog.actorUsername || selectedLog.actorId || "System"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <Paragraph className="audit-log-description">
                {selectedLog.description || "-"}
              </Paragraph>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};
