import React from "react";
import { Space } from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTable from "../../../components/common/table/AdminTable";
import {
  AdminActionButton,
  AdminConfirmAction,
  AdminTableActions,
} from "../../../components/common/table/AdminTableActions";
import AdminTableSwitch from "../../../components/common/table/AdminTableSwitch";
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
        <div className="admin-table-cell-stack">
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
      align: "center",
      render: (active, record) => (
        <AdminTableSwitch
          checked={active}
          onChange={(checked) => updateDocumentStatus(record.id, checked)}
        />
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
        <AdminTableActions>
          <AdminActionButton
            title="Tải xuống"
            variant="info"
            icon={<DownloadOutlined />}
            href={record.downloadUrl}
            target="_blank"
          />
          <AdminActionButton
            title="Sửa tài liệu"
            variant="warning"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <AdminConfirmAction
            buttonTitle="Xóa tài liệu"
            confirmTitle="Xóa tài liệu này?"
            okText="Xóa"
            onConfirm={() => deleteDocument(record.id)}
            danger
            icon={<DeleteOutlined />}
          />
        </AdminTableActions>
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
          <AdminTable
            rowKey="id"
            columns={columns}
            dataSource={documents}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1420 }}
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
