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
    <div className="container-fluid">
      <div className="d-flex flex-column flex-lg-row min-vh-100">
        {/* Sidebar */}
        <div
          className="flex-shrink-0 sidebar-container"
          style={{
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <div
            className="sidebar p-3 p-md-4 border rounded bg-light h-100"
            style={{ width: "100%" }}
          >
            <h3 className="responsive-heading mb-3">{texts.categoriesTitle}</h3>

            {error && <p className="text-danger small">{error}</p>}

            <ul className="list-unstyled">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.categoryId} className="mb-2">
                    <button
                      onClick={() => onSelectCategory(category.categoryId)}
                      className={`btn w-100 text-start text-truncate btn-sm responsive-button 
                    ${selectedCategory === category.categoryId
                          ? "btn-primary"
                          : "btn-outline-primary"}`}
                      aria-pressed={selectedCategory === category.categoryId}
                    >
                      <span className="d-block responsive-text">
                        {categoryTranslations[category.categoryName]
                          ? categoryTranslations[category.categoryName][language]
                          : category.categoryName}
                      </span>
                    </button>
                  </li>
                ))
              ) : (
                <p className="small">{texts.noCategories}</p>
              )}
            </ul>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-grow-1 p-3">
          {/* Nội dung chính ở đây */}
        </div>
      </div>
    </div>






  );
};

export default Sidebar;