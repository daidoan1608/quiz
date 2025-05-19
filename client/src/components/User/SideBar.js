import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import "../User/SideBar.css";
import { useLanguage } from "../../components/Context/LanguageProvider";
import categoryTranslations from "../../Languages/categoryTranslations";

const Sidebar = ({ selectedCategory, onSelectCategory, onSearchChange }) => {
  const [categories, setCategories] = useState([]); // Danh sách khoa
  const [error, setError] = useState(null); // Lưu thông báo lỗi
  const { texts, language } = useLanguage(); // Lấy văn bản từ LanguageContext

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
      setError(texts.categoriesError); // Sử dụng văn bản lỗi từ texts
    }
  };

  return (
    <div className="sidebar">
      <h3>{texts.categoriesTitle}</h3>

      {error && <p className="error-message">{error}</p>}

      <ul>
        {categories.length > 0 ? (
          categories.map((category) => (
            <li key={category.categoryId}>
              <button
                onClick={() => onSelectCategory(category.categoryId)}
                className={selectedCategory === category.categoryId ? "selected" : ""}
                aria-pressed={selectedCategory === category.categoryId}
              >
                {categoryTranslations[category.categoryName]
                  ? categoryTranslations[category.categoryName][language]
                  : category.categoryName}
              </button>
            </li>
          ))
        ) : (
          <p>{texts.noCategories}</p>
        )}
      </ul>

    </div>
  );
};

export default Sidebar;