import React from "react";
import {
  Button,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  UndoOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ManagementPageLayout from "../../../layouts/ManagementPageLayout";
import AdminTableText from "../../../components/common/table/AdminTableText";
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
      render: (text) => <AdminTableText copyable>{text}</AdminTableText>,
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
          <Space>
            <Tooltip title={isMod ? "Không có quyền sửa" : "Sửa thông tin"}>
              <Button
                className="action-btn is-primary"
                icon={<EditOutlined />}
                disabled={isMod}
                onClick={() => openEditModal(record.userId)}
              />
            </Tooltip>
            <Tooltip
              title={record.role === "MOD" ? "Gán nhóm quyền" : "Chỉ áp dụng cho MOD"}
            >
              <Button
                className="action-btn"
                icon={<TeamOutlined />}
                disabled={isMod || record.role !== "MOD"}
                onClick={() => openGroupsModal(record)}
              />
            </Tooltip>
            <Tooltip title={isMod ? "Không có quyền" : "Vô hiệu hóa"}>
              <Popconfirm
                title="Vô hiệu hóa người dùng?"
                description="Người dùng sẽ không đăng nhập được, refresh token và quyền MOD hiện có sẽ bị thu hồi."
                onConfirm={() => disableUser(record.userId)}
                okText="Vô hiệu hóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                disabled={isMod}
              >
                <Button
                  className="action-btn is-danger"
                  icon={<StopOutlined />}
                  disabled={isMod}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        ) : (
          <Popconfirm
            title="Khôi phục người dùng?"
            description="Người dùng đăng nhập lại được nếu tài khoản hợp lệ, quyền MOD cần cấp lại thủ công."
            onConfirm={() => restoreUser(record.userId)}
            okText="Khôi phục"
            cancelText="Hủy"
          >
            <Button
              className="action-btn is-success"
              icon={<UndoOutlined />}
              disabled={isMod}
            />
          </Popconfirm>
        ),
    },
  ];

  const filters = (
    <Space size="middle" wrap>
      <Segmented
        value={viewMode}
        onChange={setViewMode}
        options={[
          { label: "Đang hoạt động", value: "active" },
          { label: "Đã vô hiệu hóa", value: "deleted" },
        ]}
      />
      <Select value={selectedRole} style={{ width: 150 }} onChange={setSelectedRole}>
        <Option value="all">Tất cả</Option>
        <Option value="ADMIN">ADMIN</Option>
        <Option value="MOD">MOD</Option>
        <Option value="USER">USER</Option>
      </Select>
      <Select
        value={selectedProvider}
        style={{ width: 150 }}
        onChange={setSelectedProvider}
      >
        <Option value="all">Mọi nguồn</Option>
        <Option value="LOCAL">LOCAL</Option>
        <Option value="GOOGLE">GOOGLE</Option>
        <Option value="FACEBOOK">FACEBOOK</Option>
        <Option value="GITHUB">GITHUB</Option>
      </Select>
      <Select
        value={selectedEmailVerified}
        style={{ width: 150 }}
        onChange={setSelectedEmailVerified}
      >
        <Option value="all">Mọi email</Option>
        <Option value="verified">Đã xác thực</Option>
        <Option value="unverified">Chưa xác thực</Option>
      </Select>
      <Input
        placeholder="Tìm username, tên..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        allowClear
        style={{ width: 300 }}
      />
    </Space>
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
          <Button
            className="toolbar-btn"
            icon={<DownloadOutlined />}
            onClick={downloadUsers}
          >
            Export CSV
          </Button>
        }
        table={
          <Table
            columns={columns}
            dataSource={users}
            rowKey="userId"
            loading={loading}
            pagination={{ pageSize: 7 }}
            scroll={{ x: viewMode === "active" ? 1080 : 1010 }}
            tableLayout="fixed"
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
