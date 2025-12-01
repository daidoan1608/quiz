import React, { useEffect, useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { BiTrash, BiEdit } from "react-icons/bi";

// Các quyền có thể có
const ALL_PERMISSIONS = ["CREATE", "READ", "UPDATE", "DELETE"];

export default function UpdateUser() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // State cơ bản của người dùng
  const [user, setUser] = useState({ fullName: "", email: "", role: "" });

  // State quản lý quyền MOD cho form Sửa/Thêm
  const [modPermissions, setModPermissions] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [currentModPermissions, setCurrentModPermissions] = useState({});

  // State cho logic lọc Category -> Subject
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [modPermissionExists, setModPermissionExists] = useState(false);

  // State quản lý hiển thị form
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNewPermission, setIsAddingNewPermission] = useState(false);

  // --- 1. Fetch Dữ liệu ---

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authAxios.get("/public/categories");
        const fetchedCategories =
          response.data.data[0] || response.data.data || [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // Lấy quyền của MOD
  const fetchModPermissions = async (modId) => {
    try {
      const response = await authAxios.get(`/admin/permissions/mod/${modId}`);
      const permissionsMap = response.data || {};

      setCurrentModPermissions(permissionsMap);

      const exists = Object.keys(permissionsMap).length > 0;
      setModPermissionExists(exists);

      handleCancelEdit(); // Reset form Thêm/Sửa
    } catch (error) {
      console.error("Lỗi khi fetch Permissions:", error);
      setCurrentModPermissions({});
      setModPermissionExists(false);
      handleCancelEdit();
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await authAxios.get(`user/${userId}`);
      const userData = response.data.data;
      setUser({
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role || "",
      });
    } catch (error) {
      console.error(
        "Lỗi khi lấy thông tin người dùng:",
        error.response?.data || error.message
      );
      alert("Không thể lấy thông tin người dùng!");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  // Fetch Mod Permissions ngay khi role được xác nhận là MOD
  useEffect(() => {
    if (user.role === "MOD") {
      fetchModPermissions(userId);
    } else if (user.role !== "") {
      setCurrentModPermissions({});
      setModPermissionExists(false);
      handleCancelEdit();
    }
  }, [user.role, userId]);

  // Logic lọc subjects khi categoryId thay đổi
  useEffect(() => {
    setFilteredSubjects([]);
    if (!categoryId) {
      setSubjectId("");
      return;
    }

    const selectedCategory = categories.find(
      (cat) => cat.categoryId === Number(categoryId)
    );
    setFilteredSubjects(
      selectedCategory ? selectedCategory.subjects || [] : []
    );

    if (subjectId && selectedCategory) {
      const isSubjectInNewCategory = selectedCategory.subjects.some(
        (sub) => String(sub.subjectId) === subjectId
      );
      if (!isSubjectInNewCategory) {
        setSubjectId("");
      }
    }
  }, [categoryId, categories]);

  // --- 2. Xử lý Thao tác Quyền MOD ---

  const getSubjectName = (subId) => {
    for (const cat of categories) {
      const subject = cat.subjects.find(
        (sub) => String(sub.subjectId) === subId
      );
      if (subject) return subject.name;
    }
    return `ID: ${subId}`;
  };

  const handlePermissionChange = (permission) => {
    setModPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleCancelEdit = () => {
    setSubjectId("");
    setModPermissions([]);
    setCategoryId("");
    setIsEditing(false);
    setIsAddingNewPermission(false);
  };

  const handleEditPermission = (subId, permissions) => {
    setSubjectId(subId);
    setModPermissions(permissions);
    setIsEditing(true);
    setIsAddingNewPermission(true);

    const foundCategory = categories.find(
      (cat) =>
        cat.subjects &&
        cat.subjects.some((sub) => String(sub.subjectId) === subId)
    );
    setCategoryId(foundCategory ? String(foundCategory.categoryId) : "");
  };

  const handleDeletePermission = async (subId) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa quyền MOD cho Môn học ID: ${subId}?`
      )
    ) {
      return;
    }
    try {
      await authAxios.delete(`/delete/permissions/mod/${userId}/${subId}`);
      alert("Xóa quyền MOD thành công!");
      fetchModPermissions(userId);
    } catch (error) {
      console.error("Lỗi khi xóa quyền MOD:", error);
      alert("Không thể xóa quyền MOD!");
    }
  };

  const updateModPermissions = async () => {
    if (!subjectId || modPermissions.length === 0) {
      alert(
        "Vui lòng chọn Môn học và ít nhất một Quyền cho MOD trước khi lưu."
      );
      return;
    }

    const permissionPayload = {
      modUserId: userId,
      subjectId: parseInt(subjectId),
      permissions: modPermissions,
    };

    try {
      await authAxios.post("/update/permissions/mod", permissionPayload);
      alert(
        isEditing ? "Cập nhật quyền thành công!" : "Thêm quyền thành công!"
      );
      await fetchModPermissions(userId);
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật quyền MOD:",
        error.response?.data || error.message
      );
      alert("Không thể cập nhật quyền MOD!");
    }
  };

  const handleUpdateUser = async () => {
    try {
      const updatedUser = {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      };
      await authAxios.patch(`/update/users/${userId}`, updatedUser);

      if (user.role !== "MOD" && modPermissionExists) {
        await authAxios.delete(`/delete/permissions/mod/${userId}`);
      }

      alert("Cập nhật thông tin người dùng thành công!");
      navigate("/admin/users");
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật thông tin người dùng:",
        error.response?.data || error.message
      );
      alert("Không thể cập nhật thông tin người dùng!");
    }
  };

  const handleRoleChange = (newRole) => {
    setUser({ ...user, role: newRole });
    setCurrentModPermissions({});
    setModPermissionExists(false);
    handleCancelEdit();
  };

  return (
    <div>
      <h2>Cập nhật thông tin người dùng</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Họ và tên */}
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">
            Họ và tên
          </label>
          <input
            type="text"
            className="form-control"
            id="fullName"
            value={user.fullName}
            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </div>

        {/* Vai trò */}
        <div className="mb-3">
          <label htmlFor="role" className="form-label">
            Vai trò
          </label>
          <select
            className="form-control"
            id="role"
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
            <option value="MOD">MOD</option>
          </select>
        </div>

        {/* Nút Lưu thông tin cơ bản */}
        <button className="btn btn-primary mb-4" onClick={handleUpdateUser}>
          Cập nhật Thông Tin Cơ Bản
        </button>

        {/* PHẦN QUẢN LÝ QUYỀN MOD */}
        {user.role === "MOD" && (
          <div className="mod-permissions-section border p-3 mb-4 rounded">
            <h4>⚙️ Quyền quản lý Kiểm duyệt viên (MOD)</h4>
            <hr />

            {/* Nút Thêm Quyền Mới */}
            <div className="d-flex justify-content-end mb-3">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  handleCancelEdit();
                  setIsAddingNewPermission(true);
                }}
              >
                + Thêm Quyền Mới
              </button>
            </div>

            {/* Danh sách quyền hiện có */}
            {Object.keys(currentModPermissions).length > 0 ? (
              <div>
                <h5>Danh sách Quyền đã cấp:</h5>
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Môn học (ID)</th>
                      <th>Quyền</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(currentModPermissions).map(
                      ([subId, perms]) => (
                        <tr key={subId}>
                          <td>
                            {getSubjectName(subId)} ({subId})
                          </td>
                          <td>{perms.join(", ")}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleEditPermission(subId, perms)}
                            >
                              <BiEdit className="icon" /> Sửa
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeletePermission(subId)}
                            >
                              <BiTrash className="icon" /> Xóa
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="alert alert-info">
                Người dùng này chưa có quyền MOD nào được cấp. Bấm{" "}
                <strong>'+ Thêm Quyền Mới'</strong> để bắt đầu.
              </p>
            )}

            {/* FORM THÊM/SỬA QUYỀN */}
            {(isAddingNewPermission || isEditing) && (
              <>
                <hr />
                <h5>
                  {isEditing
                    ? `Chỉnh sửa Quyền cho Môn học ID: ${subjectId}`
                    : "Thêm Quyền mới"}
                </h5>
                <div className="card card-body">
                  {/* Chọn Khoa */}
                  <div className="mb-3">
                    <label htmlFor="categoryId" className="form-label">
                      Chọn Khoa
                    </label>
                    <select
                      className="form-control"
                      id="categoryId"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="">--Chọn khoa--</option>
                      {categories.map((category) => (
                        <option
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chọn Môn học */}
                  <div className="mb-3">
                    <label htmlFor="subjectId" className="form-label">
                      Môn học quản lý:
                    </label>
                    <select
                      className="form-control"
                      id="subjectId"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      required
                      disabled={filteredSubjects.length === 0}
                    >
                      <option value="">-- Chọn Môn học --</option>
                      {filteredSubjects.map((subject) => (
                        <option
                          key={subject.subjectId}
                          value={subject.subjectId}
                        >
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chọn Quyền */}
                  <div className="mb-3">
                    <label className="form-label d-block">
                      Quyền được cấp:
                    </label>
                    {ALL_PERMISSIONS.map((permission) => (
                      <div
                        key={permission}
                        className="form-check form-check-inline"
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`perm-${permission}`}
                          value={permission}
                          checked={modPermissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`perm-${permission}`}
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Nút Lưu quyền */}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCancelEdit}
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={updateModPermissions}
                      disabled={!subjectId}
                    >
                      {isEditing ? "Lưu Thay Đổi Quyền" : "Thêm Quyền Mới"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
