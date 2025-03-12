import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import "./Sidebar.css";

const Sidebar = ({ selectedCategory, onSelectCategory, onSearchChange }) => {
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
  const [categories, setCategories] = useState([]); // Danh sách khoa
  const [error, setError] = useState(null); // Lưu thông báo lỗi


  // Hàm xử lý thay đổi trong ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearchChange(e.target.value); // Gọi hàm từ component cha để lọc danh sách môn học
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    try {
      const res = await publicAxios.get("public/categories");
      setCategories(res.data);
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
      <input
        type="text"
        placeholder="Tìm kiếm môn học..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-bar"
      />
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
