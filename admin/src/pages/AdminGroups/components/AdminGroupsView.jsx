import React from "react";
import { Modal, Space } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTable from "../../../components/common/table/AdminTable";
import {
  AdminActionButton,
  AdminTableActions,
} from "../../../components/common/table/AdminTableActions";
import AdminTableSwitch from "../../../components/common/table/AdminTableSwitch";

export const AdminGroupsView = ({
  groups,
  loading,
  fetchGroups,
  removeGroup,
  toggleGroupActive,
}) => {
  const navigate = useNavigate();

  const confirmRemoveGroup = (record) => {
    Modal.confirm({
      title: "Xóa nhóm quyền?",
      content: `Nhóm "${record.name || record.code}" sẽ bị xóa khỏi hệ thống.`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => removeGroup(record.id),
    });
  };

  const columns = [
    { title: "Mã", dataIndex: "code", width: 220 },
    { title: "Tên nhóm", dataIndex: "name", width: 260 },
    { title: "Mô tả", dataIndex: "description", ellipsis: true },
    {
      title: "Trạng thái",
      dataIndex: "active",
      width: 120,
      align: "center",
      render: (active, record) => (
        <AdminTableSwitch
          checked={active !== false}
          onChange={(checked) => toggleGroupActive(record, checked)}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <AdminTableActions>
          <AdminActionButton
            title="Sửa nhóm quyền"
            variant="warning"
            icon={<EditOutlined />}
            onClick={() => navigate(`/groups/${record.id}/edit`)}
          />
          <AdminActionButton
            title="Xóa nhóm quyền"
            variant="danger"
            icon={<DeleteOutlined />}
            onClick={() => confirmRemoveGroup(record)}
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
            <SafetyCertificateOutlined /> Nhóm quyền
          </Space>
        }
        table={
          <AdminTable
            rowKey="id"
            columns={columns}
            dataSource={groups}
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        }
        onReload={fetchGroups}
        onAdd={() => navigate("/groups/create")}
      />
    </>
  );
};
