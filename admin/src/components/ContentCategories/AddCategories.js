import React, { useState } from "react";
import { authAxios } from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function AddCategory() {
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    categoryDescription: "",
  });

  const navigate = useNavigate();

  // Hàm thêm category mới
  const addCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await authAxios.post("/admin/categories", newCategory);
      console.log("Thêm thể loại thành công: ", response.data.data);
      setNewCategory({
        categoryName: "",
        categoryDescription: "",
      });
      navigate("/categories"); // Quay về danh sách categories sau khi thêm
    } catch (error) {
      console.error("Lỗi khi thêm thể loại: ", error);
      alert("Không thể thêm thể loại!");
    }
  };

  return (
    <div>
      <h2>Thêm khoa</h2>
      <form onSubmit={addCategory}>
        {/* Tên khoa */}
        <div className="form-group mb-3">
          <label>Tên khoa</label>
          <input
            type="text"
            className="form-control"
            value={newCategory.categoryName}
            onChange={(e) =>
              setNewCategory({ ...newCategory, categoryName: e.target.value })
            }
            required
          />
        </div>

        {/* Mô tả thể loại */}
        <div className="form-group mb-3">
          <label>Mô tả</label>
          <textarea
            className="form-control"
            value={newCategory.categoryDescription}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                categoryDescription: e.target.value,
              })
            }
          />
        </div>

        {/* Nút lưu */}
        <button type="submit" className="btn btn-success">
          Lưu
        </button>
        {/* Nút hủy */}
        <button
          type="button"
          className="btn btn-secondary mx-2"
          onClick={() => navigate("/categories")}
        >
          Hủy
        </button>
      </form>
    </div>
  );
}
