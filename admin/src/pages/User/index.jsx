import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import {
  Table,
  Tag,
  Button,
  Select,
  Popconfirm,
  Space,
  Typography,
  Tooltip,
  message,
  Input,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";

// IMPORT LAYOUT CHUNG
import ManagementPageLayout from '../../layouts/ManagementPageLayout'; // <-- Thay đổi đường dẫn nếu cần

// IMPORT CÁC MODAL ĐÃ TÁCH
import AddUserModal from "../../components/modal/AddUserModal";
import UpdateUserModal from "../../components/modal/UpdateUserModal";

const { Text } = Typography;
const { Option } = Select;

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchText, setSearchText] = useState("");

  // --- STATES QUẢN LÝ MODAL ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Lấy role hiện tại
  const currentUserRole = localStorage.getItem("role");
  const isMod = currentUserRole === "MOD";

  // --- 1. CALL API ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get("/admin/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Lỗi API:", error);
      message.error("Không thể lấy danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 2. XỬ LÝ XÓA USER (Giữ nguyên) ---
  const handleDelete = async (userId) => {
    if (isMod) {
      message.warning("Bạn không có quyền thực hiện hành động này.");
      return;
    }

    try {
      await authAxios.delete(`/admin/delete/users/${userId}`);
      message.success("Xóa người dùng thành công!");
      setUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (error) {
      message.error(
        "Không thể xóa người dùng: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // --- 3. XỬ LÝ MỞ MODAL SỬA USER (Giữ nguyên) ---
  const handleEdit = (userId) => {
    if (isMod) {
      message.warning("Bạn không có quyền chỉnh sửa.");
      return;
    }
    setSelectedUserId(userId);
    setIsUpdateModalOpen(true);
  };

  // --- 4. LỌC DỮ LIỆU (Client-side) (Giữ nguyên) ---
  const getFilteredData = () => {
    return users.filter((user) => {
      const matchRole = selectedRole === "all" || user.role === selectedRole;
      const lowerSearch = searchText.toLowerCase();
      const matchSearch =
        (user.username && user.username.toLowerCase().includes(lowerSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
        (user.fullName && user.fullName.toLowerCase().includes(lowerSearch));

      return matchRole && matchSearch;
    });
  };

  const handleModalClose = () => {
    setIsUpdateModalOpen(false);
    setSelectedUserId(null);
    setIsAddModalOpen(false);
  };

  // --- CẤU HÌNH CỘT CHO TABLE (Giữ nguyên) ---
  const columns = [
    {
      title: "UUID", dataIndex: "userId", key: "userId", width: 80,
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ width: 50 }} ellipsis copyable>{text}</Text>
        </Tooltip>
      ),
    },
    { title: "Tài khoản", dataIndex: "username", key: "username", render: (text) => <Text strong>{text}</Text> },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Vai trò", dataIndex: "role", key: "role",
      render: (role) => {
        let color = "blue";
        if (role === "ADMIN") color = "red";
        if (role === "MOD") color = "orange";
        if (role === "USER") color = "green";
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: "Hành động", key: "action", width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title={isMod ? "Không có quyền sửa" : "Sửa thông tin"}>
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              disabled={isMod}
              onClick={() => handleEdit(record.userId)}
            />
          </Tooltip>

          <Tooltip title={isMod ? "Không có quyền xóa" : "Xóa người dùng"}>
            <Popconfirm
              title="Xóa người dùng này?"
              description={`Bạn có chắc muốn xóa ${record.username}?`}
              onConfirm={() => handleDelete(record.userId)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={isMod}
            >
              <Button danger icon={<DeleteOutlined />} disabled={isMod} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // --- ĐỊNH NGHĨA COMPONENTS CON CHO LAYOUT ---

  // 1. Tiêu đề chính
  const pageTitle = (
    <Space>
      <UserOutlined /> Quản lý người dùng
    </Space>
  );

  // 2. Bộ lọc/Tìm kiếm (Filters)
  const userFilters = (
    <Space size="middle" wrap>
      {/* Lọc theo Role */}
      <div>
        <Select
          defaultValue="all"
          style={{ width: 150 }}
          onChange={setSelectedRole}
        >
          <Option value="all">Tất cả</Option>
          <Option value="ADMIN">ADMIN</Option>
          <Option value="MOD">MOD</Option>
          <Option value="USER">USER</Option>
        </Select>
      </div>

      {/* Tìm kiếm */}
      <div>
        <Input
          placeholder="Nhập tên, email hoặc username..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
      </div>
    </Space>
  );

  // 3. Bảng Dữ liệu (Table)
  const userTable = (
    <Table
      columns={columns}
      dataSource={getFilteredData()}
      rowKey="userId"
      loading={loading}
      pagination={{
        pageSize: 7,
      }}
      scroll={{ x: 800 }}
    />
  );

  return (
    <>
      {/* SỬ DỤNG MANAGEMENTPAGELAYOUT THAY CHO CARD CŨ */}
      <ManagementPageLayout
        title={pageTitle}
        filters={userFilters}
        table={userTable}
        onReload={fetchUsers}
        onAdd={() => setIsAddModalOpen(true)}

        // Thêm nút phụ nếu cần (ví dụ: nút "Thêm User mới" có thể được coi là extra nếu không dùng onAdd)
        // extra={isMod ? null : <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>Thêm User mới</Button>}
      />

      {/* MODAL THÊM NGƯỜI DÙNG */}
      <AddUserModal
        isModalOpen={isAddModalOpen}
        onCancel={handleModalClose}
        onSuccess={fetchUsers} // Gọi lại API để làm mới bảng
      />

      {/* MODAL CẬP NHẬT NGƯỜI DÙNG */}
      {isUpdateModalOpen && selectedUserId && (
        <UpdateUserModal
          isModalOpen={isUpdateModalOpen}
          onCancel={handleModalClose}
          onSuccess={fetchUsers} // Gọi lại API để làm mới bảng
          userId={selectedUserId}
        />
      )}
    </>
  );
}