import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Pagination from "../common/Pagination";
import { BiTrash, BiEdit, BiPlus } from "react-icons/bi";
import "../../styles/responsiveTable.css";

export default function GetUser() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("all");
  const pageSize = 7;
  const navigate = useNavigate();

  const currentUserRole = localStorage.getItem("role");

  // Kiểm tra xem người dùng hiện tại có phải là MOD không
  const isMod = currentUserRole === "MOD";

  // Hàm lấy danh sách người dùng (Không thay đổi)
  const fetchUsers = async () => {
    // ... (logic fetchUsers không thay đổi)
    try {
      const response = await authAxios.get("/admin/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Lỗi API:", error.response?.data || error.message);
      alert("Không thể lấy danh sách người dùng!");
    }
  };

  // Hàm xóa người dùng (Thêm kiểm tra isMod)
  const deleteUser = async (userId, userName) => {
    // 🔴 THAY ĐỔI Ở ĐÂY: Không cho phép MOD xóa
    if (isMod) {
      alert("Bạn không có quyền thực hiện hành động này.");
      return;
    }

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

  // Hàm cập nhật người dùng (Thêm kiểm tra isMod)
  const updateUser = (userId) => {
    // 🔴 THAY ĐỔI Ở ĐÂY: Không cho phép MOD chỉnh sửa
    if (isMod) {
      alert("Bạn không có quyền thực hiện hành động này.");
      return;
    }
    navigate(`/update/users/${userId}`);
  };

  // Lấy danh sách người dùng khi component được render (Không thay đổi)
  useEffect(() => {
    fetchUsers();
  }, []);

  // Các hàm lọc và phân trang khác không thay đổi...
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setCurrentPage(1);
  };

  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);

  const startIndex = (currentPage - 1) * pageSize;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const availableRoles = ["all", "ADMIN", "USER", "MOD"];

  return (
    <div className="responsive-table">
      <h2 className="heading-content">Quản lý người dùng</h2>

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
          className={`btn add-btn btn-primary ${isMod ? "disabled" : ""}`} // 🔴 THAY ĐỔI Ở ĐÂY: Thêm class 'disabled'
          onClick={() => {
            // 🔴 THAY ĐỔI Ở ĐÂY: Kiểm tra MOD trước khi điều hướng
            if (!isMod) {
              navigate(`/admin/add/user`);
            } else {
              alert("Bạn không có quyền thêm người dùng.");
            }
          }}
          disabled={isMod} // Vô hiệu hóa nút
          title={isMod ? "Bạn không có quyền thêm user" : "Thêm User mới"} // Thêm tooltip
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
                <td data-label="Mã tài khoản" className="truncated-text">
                  {user.userId}
                </td>
                <td data-label="Tên tài khoản">{user.username}</td>
                <td data-label="Họ và tên">{user.fullName}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">{user.role}</td>
                <td data-label="Action">
                  {/* 🔴 THAY ĐỔI Ở ĐÂY: Vô hiệu hóa nút Sửa và Xóa nếu là MOD */}
                  <button
                    className="btn btn-success mx-1"
                    onClick={() => updateUser(user.userId)}
                    disabled={isMod} // Vô hiệu hóa
                    title={isMod ? "Không có quyền sửa" : "Sửa User"} // Tooltip
                  >
                    <BiEdit className="icon" />
                  </button>
                  <button
                    className="btn btn-danger mx-1"
                    onClick={() => deleteUser(user.userId, user.username)}
                    disabled={isMod} // Vô hiệu hóa
                    title={isMod ? "Không có quyền xóa" : "Xóa User"} // Tooltip
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
