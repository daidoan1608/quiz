import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAxios } from "../../Api/axiosConfig";

export default function UpdateCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState({
    categoryName: "",
    categoryDescription: "",
  });

  // Lấy thông tin category ban đầu
  useEffect(() => {
    getCategoryDetails();
    // eslint-disable-next-line
  }, []);

  const getCategoryDetails = async () => {
    try {
      const res = await authAxios.get(`admin/categories/${categoryId}`);
      setCategory(res.data.data);
      console.log(res.data.data);
    } catch (error) {
      alert("Không thể lấy thông tin thể loại!");
    }
  };

  // Cập nhật category
  const handleUpdate = async () => {
    try {
      await authAxios.put(`/admin/categories/${categoryId}`, category);
      alert("Thể loại đã được cập nhật thành công!");
      navigate("/categories");
    } catch (error) {
      alert("Không thể cập nhật thể loại!");
    }
  };

  // Xử lý thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Cập nhật thông tin thể loại</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">Tên Khoa</label>
          <input
            type="text"
            className="form-control"
            name="categoryName"
            value={category.categoryName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            name="categoryDescription"
            value={category.categoryDescription || ""}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUpdate}
        >
          Cập nhật
        </button>
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
