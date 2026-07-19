import React from "react";
import { Button, Popconfirm, Space, Switch, Table, Tag } from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTableText from "../../../components/common/table/AdminTableText";
import { DocumentModal } from "./DocumentModal";
import { formatDateTime, formatFileSize } from "../utils/documentFormatters";

export const DocumentsManagerView = ({
  documents,
  loading,
  saving,
  modalOpen,
  editing,
  form,
  loadDocuments,
  openCreateModal,
  openEditModal,
  closeModal,
  saveDocument,
  deleteDocument,
  updateDocumentStatus,
  setSelectedFile,
}) => {
  const columns = [
    {
      title: "Tài liệu",
      dataIndex: "title",
      key: "title",
      width: 360,
      ellipsis: true,
      sorter: (a, b) => String(a.title || "").localeCompare(String(b.title || "")),
      render: (title, record) => (
        <div style={{ minWidth: 0 }}>
          <AdminTableText strong>{title}</AdminTableText>
          <div>
            <AdminTableText type="secondary">
              {record.originalFilename}
            </AdminTableText>
          </div>
        </div>
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
        <AdminTableText empty="Không có mô tả">{value}</AdminTableText>
      ),
    },
    {
      title: "Dung lượng",
      dataIndex: "fileSize",
      key: "fileSize",
      width: 130,
      sorter: (a, b) => Number(a.fileSize || 0) - Number(b.fileSize || 0),
      render: formatFileSize,
    },
    {
      title: "Hiển thị",
      dataIndex: "active",
      key: "activeSwitch",
      width: 110,
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => updateDocumentStatus(record.id, checked)}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 130,
      sorter: (a, b) => Number(a.active) - Number(b.active),
      render: (active) => (
        <Tag color={active ? "green" : "default"}>
          {active ? "Đang chia sẻ" : "Đã ẩn"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      render: formatDateTime,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 190,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<DownloadOutlined />} href={record.downloadUrl} target="_blank" />
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Xóa tài liệu này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteDocument(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <FolderOpenOutlined /> Quản lý tài liệu
          </Space>
        }
        table={
          <Table
            rowKey="id"
            columns={columns}
            dataSource={documents}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1420 }}
            tableLayout="fixed"
          />
        }
        onReload={loadDocuments}
        onAdd={openCreateModal}
      />

      <DocumentModal
        form={form}
        editing={editing}
        modalOpen={modalOpen}
        saving={saving}
        closeModal={closeModal}
        saveDocument={saveDocument}
        setSelectedFile={setSelectedFile}
      />
    </>
  );
};
