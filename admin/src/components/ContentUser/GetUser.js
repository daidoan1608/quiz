import React, { useEffect, useState } from "react";
import { authAxios } from "../../Api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { BiTrash, BiEdit, BiPlus } from "react-icons/bi"; // Import các icon từ react-icons

export default function GetUser() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
  const deleteUser = async (userId,userName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${userName} ?`)) {
      try {
        await authAxios.delete(`/admin/delete/users/${userId}`);
        setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
        alert("Xóa người dùng thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error.response?.data || error.message);
        alert("Không thể xóa người dùng!"); 
      }
    }
   };

  // Hàm cập nhật người dùng
  const updateUser = (userId) => {
    navigate(`/update/users/${userId}`);
  };

  // Tính toán người dùng cho trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;
  const currentUsers = users.slice(startIndex, startIndex + pageSize);

  // Tính tổng số trang
  const totalPages = Math.ceil(users.length / pageSize);

  // Hàm thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lấy danh sách người dùng khi component được render
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Quản lý User</h2>

      {/* Nút chuyển đến trang thêm người dùng */}

      <button
        className="btn add-btn btn-primary mb-3 float-end"
        onClick={() => navigate(`/admin/add/user`)}
      >
        <BiPlus className="icon" />
      </button>

      {/* Bảng danh sách người dùng */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Mã tài khoản</th>
            <th>Tên tài khoản</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.userId}</td>
              <td>{user.username}</td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className="btn btn-success mx-1"
                  onClick={() => updateUser(user.userId)}
                >
                  <BiEdit className="icon" />
                </button>
                <button
                  className="btn btn-danger mx-1"
                  onClick={() => deleteUser(user.userId,user.username)}
                >
                  <BiTrash className="icon" />
                </button>
              </td>
            </tr>
          ))}
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
