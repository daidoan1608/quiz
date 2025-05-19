import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import '../User/SideBar.css'


const Sidebar = ({ selectedCategory, onSelectCategory, onSearchChange }) => {
  
  const [categories, setCategories] = useState([]); // Danh sách khoa
  const [error, setError] = useState(null); // Lưu thông báo lỗi


  // Hàm xử lý thay đổi trong ô tìm kiếm
  

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    try {
      const res = await publicAxios.get("public/categories");
      const categoryData = res.data.data.flat(); // Dùng flat() để xử lý dữ liệu nếu có nested array
      setCategories(categoryData);
      setError(null);
    } catch (error) {
      console.error(error);
      setCategories([]); // Trả về danh sách rỗng khi gặp lỗi
      setError("Không thể tải danh sách khoa. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="sidebar">
      <h3>Danh sách khoa</h3>
      {/* Thanh tìm kiếm */}

      {error && <p className="error-message">{error}</p>}

      <ul>
        {categories.length > 0 ? (
          categories.map((category) => (
            <li key={category.categoryId}>
              <button
                onClick={() => onSelectCategory(category.categoryId)}
                className={
                  selectedCategory === category.categoryId ? "selected" : ""
                }
              >
                {category.categoryName}
              </button>
            </li>
          ))
        ) : (
          <p>Không có danh mục nào.</p>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
