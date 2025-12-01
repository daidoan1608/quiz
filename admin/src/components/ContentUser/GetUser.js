import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Pagination from "../common/Pagination";
import { BiTrash, BiEdit, BiPlus } from "react-icons/bi";
import "../../styles/responsiveTable.css";

export default function GetUser() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("all"); // State mới cho role được chọn, mặc định là "all"
  const pageSize = 5; // Số lượng người dùng mỗi trang
  const navigate = useNavigate();

  // Hàm lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const response = await authAxios.get("/admin/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Lỗi API:", error.response?.data || error.message);
      alert("Không thể lấy danh sách người dùng!");
    }
  };

  // Hàm xóa người dùng
  const deleteUser = async (userId, userName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${userName} ?`)) {
      try {
        await authAxios.delete(`/admin/delete/users/${userId}`);
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.userId !== userId)
        );
        alert("Xóa người dùng thành công!");
      } catch (error) {
        console.error(
          "Lỗi khi xóa người dùng:",
          error.response?.data || error.message
        );
        alert("Không thể xóa người dùng!");
      }
    }
  };

  // Hàm cập nhật người dùng
  const updateUser = (userId) => {
    navigate(`/update/users/${userId}`);
  };

  // Lấy danh sách người dùng khi component được render
  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm xử lý khi role được chọn thay đổi
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Lọc danh sách người dùng dựa trên role được chọn
  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);

  // Tính toán người dùng cho trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Hàm thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lấy danh sách các role duy nhất để tạo option cho bộ lọc
  // Bạn cần thay thế bằng danh sách role thực tế trong ứng dụng của mình nếu cần
  const availableRoles = ["all", "ADMIN", "USER", "MOD"]; // Ví dụ các role có thể có
  // Hoặc bạn có thể tự động lấy từ dữ liệu nếu cấu trúc data cho phép:
  // const uniqueRoles = [...new Set(users.map(user => user.role))];
  // const availableRoles = ["all", ...uniqueRoles];

  return (
    <div className="responsive-table">
      <h2 className="heading-content">Quản lý User</h2>

      <div className="d-flex justify-content-between mb-3 align-items-center">
        {/* Bộ lọc Role */}
        <div className="filter-role">
          <label htmlFor="role-filter" className="me-2">
            Lọc theo Role:
          </label>
          <select
            id="role-filter"
            className="form-select d-inline-block w-auto"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role === "all" ? "Tất cả" : role}
              </option>
            ))}
          </select>
        </div>

        {/* Nút chuyển đến trang thêm người dùng */}
        <button
          className="btn add-btn btn-primary"
          onClick={() => navigate(`/admin/add/user`)}
        >
          <BiPlus className="icon" /> Thêm User
        </button>
      </div>

      {/* Bảng danh sách người dùng */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>UUID</th>
            <th>Username</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <tr key={index}>
                <td data-label="Mã tài khoản">{user.userId}</td>
                <td data-label="Tên tài khoản">{user.username}</td>
                <td data-label="Họ và tên">{user.fullName}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">{user.role}</td>
                <td data-label="Action">
                  <button
                    className="btn btn-success mx-1"
                    onClick={() => updateUser(user.userId)}
                  >
                    <BiEdit className="icon" />
                  </button>
                  <button
                    className="btn btn-danger mx-1"
                    onClick={() => deleteUser(user.userId, user.username)}
                  >
                    <BiTrash className="icon" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Không tìm thấy người dùng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Phân trang */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
