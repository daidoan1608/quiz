import React, { useCallback, useEffect, useState } from 'react';
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
  Typography,
  message,
} from 'antd';
import {
  EditOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UndoOutlined,
  UserOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { exportApi, userApi } from '../../api/services';
import ManagementPageLayout from '../../layouts/ManagementPageLayout';
import AddUserModal from '../../components/Modal/AddUserModal';
import UpdateUserModal from '../../components/Modal/UpdateUserModal';
import SubjectPermissionModal from '../../components/Modal/SubjectPermissionModal';

const { Text } = Typography;
const { Option } = Select;

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPermissionUser, setSelectedPermissionUser] = useState(null);

  const currentUserRole = localStorage.getItem('role');
  const isMod = currentUserRole === 'MOD';

  const fetchUsers = useCallback(
    async (keyword = searchText) => {
      setLoading(true);
      try {
        const trimmedKeyword = keyword.trim();
        const data =
          viewMode === 'deleted'
            ? await userApi.getDeleted()
            : trimmedKeyword
              ? await userApi.search(trimmedKeyword)
              : await userApi.getAll();
        setUsers(data);
      } catch (error) {
        message.error(
          error.response?.data?.message || 'Không thể tải danh sách người dùng.'
        );
      } finally {
        setLoading(false);
      }
    },
    [searchText, viewMode]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchUsers(searchText), 400);
    return () => clearTimeout(timeoutId);
  }, [searchText, viewMode, fetchUsers]);

  const handleDisable = async (userId) => {
    if (isMod) {
      message.warning('Bạn không có quyền thực hiện hành động này.');
      return;
    }
    try {
      await userApi.remove(userId);
      message.success('Đã vô hiệu hóa người dùng.');
      fetchUsers();
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Không thể vô hiệu hóa người dùng.'
      );
    }
  };

  const handleRestore = async (userId) => {
    try {
      await userApi.restore(userId);
      message.success('Khôi phục người dùng thành công.');
      fetchUsers();
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Không thể khôi phục người dùng.'
      );
    }
  };

  const handleEdit = (userId) => {
    if (isMod) {
      message.warning('Bạn không có quyền chỉnh sửa.');
      return;
    }
    setSelectedUserId(userId);
    setIsUpdateModalOpen(true);
  };

  const handleOpenPermissions = (user) => {
    if (user.role !== 'MOD') {
      message.warning('Cho tài khoản MOD mới có thể phân quyền theo môn.');
      return;
    }
    setSelectedPermissionUser(user);
    setIsPermissionModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUpdateModalOpen(false);
    setIsPermissionModalOpen(false);
    setSelectedUserId(null);
    setSelectedPermissionUser(null);
    setIsAddModalOpen(false);
  };

  const filteredUsers = users.filter(
    (user) => selectedRole === 'all' || user.role === selectedRole
  );

  const columns = [
    {
      title: 'UUID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ width: 90 }} ellipsis copyable>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text strong>{text}</Text>,
    },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 110,
      render: (role) => {
        const color =
          role === 'ADMIN' ? 'red' : role === 'MOD' ? 'orange' : 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    ...(viewMode === 'deleted'
      ? [
          {
            title: 'Thời điểm xóa',
            dataIndex: 'deletedAt',
            key: 'deletedAt',
            width: 180,
            render: (value) => value || <Text type="secondary">-</Text>,
          },
        ]
      : []),
    {
      title: 'Hành động',
      key: 'action',
      width: viewMode === 'active' ? 160 : 90,
      fixed: 'right',
      render: (_, record) =>
        viewMode === 'active' ? (
          <Space>
            <Tooltip title={isMod ? 'Không có quyền sửa' : 'Sửa thông tin'}>
              <Button
                className="action-btn is-primary"
                icon={<EditOutlined />}
                disabled={isMod}
                onClick={() => handleEdit(record.userId)}
              />
            </Tooltip>
            <Tooltip
              title={
                record.role === 'MOD'
                  ? 'Phân quyền môn học'
                  : 'Chỉ áp dụng cho MOD'
              }
            >
              <Button
                className="action-btn"
                icon={<SafetyCertificateOutlined />}
                disabled={isMod || record.role !== 'MOD'}
                onClick={() => handleOpenPermissions(record)}
              />
            </Tooltip>
            <Tooltip title={isMod ? 'Không có quyền' : 'Vô hiệu hóa'}>
              <Popconfirm
                title="Vô hiệu hóa người dùng?"
                description="Người dùng sẽ không đăng nhập được, refresh token và quyền MOD hiện có sẽ bị thu hồi."
                onConfirm={() => handleDisable(record.userId)}
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
            onConfirm={() => handleRestore(record.userId)}
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
          { label: 'Đang hoạt động', value: 'active' },
          { label: 'Đã vô hiệu hóa', value: 'deleted' },
        ]}
      />
      <Select
        value={selectedRole}
        style={{ width: 150 }}
        onChange={setSelectedRole}
      >
        <Option value="all">Tất cả</Option>
        <Option value="ADMIN">ADMIN</Option>
        <Option value="MOD">MOD</Option>
        <Option value="USER">USER</Option>
      </Select>
      <Input
        placeholder="Tìm username, tên..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        disabled={viewMode === 'deleted'}
        allowClear
        style={{ width: 300 }}
      />
    </Space>
  );

  const table = (
    <Table
      columns={columns}
      dataSource={filteredUsers}
      rowKey="userId"
      loading={loading}
      pagination={{ pageSize: 7 }}
      scroll={{ x: 900 }}
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
          <Button
            className="toolbar-btn"
            icon={<DownloadOutlined />}
            onClick={() => exportApi.downloadUsers()}
          >
            Export CSV
          </Button>
        }
        table={table}
        onReload={() => fetchUsers(searchText)}
        onAdd={
          !isMod && viewMode === 'active'
            ? () => setIsAddModalOpen(true)
            : undefined
        }
      />

      <AddUserModal
        isModalOpen={isAddModalOpen}
        onCancel={handleModalClose}
        onSuccess={fetchUsers}
      />

      {isUpdateModalOpen && selectedUserId && (
        <UpdateUserModal
          isModalOpen={isUpdateModalOpen}
          onCancel={handleModalClose}
          onSuccess={fetchUsers}
          userId={selectedUserId}
        />
      )}

      {isPermissionModalOpen && selectedPermissionUser && (
        <SubjectPermissionModal
          isModalOpen={isPermissionModalOpen}
          onCancel={handleModalClose}
          user={selectedPermissionUser}
        />
      )}
    </>
  );
}
