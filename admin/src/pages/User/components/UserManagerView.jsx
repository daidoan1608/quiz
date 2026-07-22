import React from "react";
import {
  Select,
  Space,
  Tag,
} from "antd";
import {
  EditOutlined,
  StopOutlined,
  TeamOutlined,
  UndoOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
  AdminStatusSegmented,
} from "../../../components/common/filters/AdminFilterControls";
import AdminTable from "../../../components/common/table/AdminTable";
import {
  AdminActionButton,
  AdminConfirmAction,
  AdminTableActions,
} from "../../../components/common/table/AdminTableActions";
import AdminTableText from "../../../components/common/table/AdminTableText";
import { AdminExportButton } from "../../../components/common/buttons/AdminButtons";
import { UserFormModal } from "./UserFormModal";
import UserGroupAssignmentModal from "./UserGroupAssignmentModal";

const { Option } = Select;

export const UserManagerView = ({
  users,
  loading,
  selectedRole,
  setSelectedRole,
  selectedProvider,
  setSelectedProvider,
  selectedEmailVerified,
  setSelectedEmailVerified,
  searchText,
  setSearchText,
  viewMode,
  setViewMode,
  isMod,
  isAddModalOpen,
  isUpdateModalOpen,
  isGroupModalOpen,
  selectedUserId,
  selectedPermissionUser,
  getSortOrder,
  handleTableChange,
  fetchUsers,
  disableUser,
  restoreUser,
  openAddModal,
  openEditModal,
  openGroupsModal,
  closeModal,
  refreshAndCloseModal,
  downloadUsers,
}) => {
  const columns = [
    {
      title: "UUID",
      dataIndex: "userId",
      key: "userId",
      width: 150,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("userId"),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
    },
    {
      title: "Tài khoản",
      dataIndex: "username",
      key: "username",
      width: 180,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("username"),
      render: (text) => <AdminTableText strong>{text}</AdminTableText>,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 220,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("fullName"),
      render: (text) => (
        <AdminTableText empty="Chưa cập nhật">{text}</AdminTableText>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 260,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder("email"),
      render: (text) => <AdminTableText>{text}</AdminTableText>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 110,
      sorter: true,
      sortOrder: getSortOrder("role"),
      render: (role) => {
        const color = role === "ADMIN" ? "red" : role === "MOD" ? "orange" : "green";
        return <Tag color={color}>{role}</Tag>;
      },
    },
    ...(viewMode === "deleted"
      ? [
          {
            title: "Thời điểm xóa",
            dataIndex: "deletedAt",
            key: "deletedAt",
            width: 180,
            sorter: true,
            sortOrder: getSortOrder("deletedAt"),
            render: (value) => <AdminTableText>{value}</AdminTableText>,
          },
        ]
      : []),
    {
      title: "Hành động",
      key: "action",
      width: viewMode === "active" ? 160 : 90,
      fixed: "right",
      render: (_, record) =>
        viewMode === "active" ? (
          <AdminTableActions>
            <AdminActionButton
              title={isMod ? "Không có quyền sửa" : "Sửa thông tin"}
              variant="warning"
              icon={<EditOutlined />}
              disabled={isMod}
              onClick={() => openEditModal(record.userId)}
            />
            <AdminActionButton
              title={record.role === "MOD" ? "Gán nhóm quyền" : "Chỉ áp dụng cho MOD"}
              variant="accent"
              icon={<TeamOutlined />}
              disabled={isMod || record.role !== "MOD"}
              onClick={() => openGroupsModal(record)}
            />
            <AdminConfirmAction
              buttonTitle={isMod ? "Không có quyền" : "Vô hiệu hóa"}
              confirmTitle="Vô hiệu hóa người dùng?"
              description="Người dùng sẽ không đăng nhập được, refresh token và quyền MOD hiện có sẽ bị thu hồi."
              onConfirm={() => disableUser(record.userId)}
              okText="Vô hiệu hóa"
              danger
              disabled={isMod}
              icon={<StopOutlined />}
            />
          </AdminTableActions>
        ) : (
          <AdminConfirmAction
            buttonTitle="Khôi phục"
            confirmTitle="Khôi phục người dùng?"
            description="Người dùng đăng nhập lại được nếu tài khoản hợp lệ, quyền MOD cần cấp lại thủ công."
            onConfirm={() => restoreUser(record.userId)}
            okText="Khôi phục"
            variant="success"
            icon={<UndoOutlined />}
            disabled={isMod}
          />
        ),
    },
  ];

  const filters = (
    <AdminFilterBar
      filters={
        <>
          <AdminFilterSelect value={selectedRole} onChange={setSelectedRole}>
            <Option value="all">Tất cả</Option>
            <Option value="ADMIN">ADMIN</Option>
            <Option value="MOD">MOD</Option>
            <Option value="USER">USER</Option>
          </AdminFilterSelect>
          <AdminFilterSelect
            value={selectedProvider}
            onChange={setSelectedProvider}
          >
            <Option value="all">Mọi nguồn</Option>
            <Option value="LOCAL">LOCAL</Option>
            <Option value="GOOGLE">GOOGLE</Option>
            <Option value="FACEBOOK">FACEBOOK</Option>
            <Option value="GITHUB">GITHUB</Option>
          </AdminFilterSelect>
          <AdminFilterSelect
            value={selectedEmailVerified}
            onChange={setSelectedEmailVerified}
          >
            <Option value="all">Mọi email</Option>
            <Option value="verified">Đã xác thực</Option>
            <Option value="unverified">Chưa xác thực</Option>
          </AdminFilterSelect>
          <AdminSearchInput
            placeholder="Tìm username, tên..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </>
      }
      statusSwitch={
        <AdminStatusSegmented
          value={viewMode}
          onChange={setViewMode}
          deletedLabel="Đã vô hiệu hóa"
        />
      }
    />
  );

  return (
    <>
      <ManagementPageLayout
        title={
          <Space>
            <UserOutlined /> Quản lý người dùng
          </Space>
        }
        filters={filters}
        extra={
          <AdminExportButton onClick={downloadUsers} />
        }
        table={
          <AdminTable
            columns={columns}
            dataSource={users}
            rowKey="userId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: viewMode === "active" ? 1080 : 1010 }}
            onChange={handleTableChange}
          />
        }
        onReload={() => fetchUsers(searchText)}
        onAdd={!isMod && viewMode === "active" ? openAddModal : undefined}
      />

      <UserFormModal
        mode="create"
        open={isAddModalOpen}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />

      <UserFormModal
        mode="edit"
        userId={selectedUserId}
        open={isUpdateModalOpen && Boolean(selectedUserId)}
        onCancel={closeModal}
        onSuccess={refreshAndCloseModal}
      />

      {isGroupModalOpen && selectedPermissionUser && (
        <UserGroupAssignmentModal
          isModalOpen={isGroupModalOpen}
          onCancel={closeModal}
          user={selectedPermissionUser}
          onSuccess={refreshAndCloseModal}
        />
      )}
    </>
  );
};
