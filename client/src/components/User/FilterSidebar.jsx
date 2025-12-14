import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { useLanguage } from "../../context/LanguageProvider";

const FilterSidebar = ({ selectedCategory, onSelectCategory }) => {
  // 1. Đồng bộ tên State: categories
  const [categories, setCategories] = useState([]);

  // State tìm kiếm nội bộ
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState(null);
  const { texts } = useLanguage();

  useEffect(() => {
    getAllCategories();
  }, []);

  // 2. Đồng bộ tên hàm: getAllCategories
  const getAllCategories = async () => {
    try {
      const res = await publicAxios.get("public/categories");

      // Kiểm tra an toàn dữ liệu trước khi flat()
      const categoryData = res.data.data ? res.data.data.flat() : [];

      setCategories(categoryData);
      setError(null);
    } catch (error) {
      console.error("Lỗi lấy danh sách danh mục:", error);
      setCategories([]);
      setError(texts.categoriesError || "Lỗi tải danh sách danh mục");
    }
  };

  const getCategoryIcon = (index) => {
    const icons = ["school", "account_balance", "agriculture", "science", "computer", "biotech", "language", "engineering"];
    return icons[index % icons.length];
  };

  // 3. Helper lấy tên an toàn (Tránh lỗi toLowerCase undefined)
  const getCategoryName = (category) => {
    if (!category) return "";
    // Ưu tiên categoryName vì API là categories
    return category.categoryName || category.name || "";
  };

  // 4. Logic LỌC danh sách (filteredCategories)
  const filteredCategories = categories.filter((category) => {
    const name = String(getCategoryName(category)).toLowerCase();
    const term = searchTerm.toLowerCase();
    // Đảm bảo name tồn tại mới so sánh
    return name && name.includes(term);
  });

  return (
    <div className="flex h-full flex-col justify-start bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="text-gray-700 dark:text-gray-200">
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
              filter_list
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal">
              Danh sách Khoa
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
              Chọn khoa để xem môn học
            </p>
          </div>
        </div>

        {/* Input: Tìm kiếm Khoa (Xử lý nội bộ) */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            search
          </span>
          <input
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-sm focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-500 text-gray-900 dark:text-white transition-colors"
            placeholder="Tìm tên khoa..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm italic text-center">{error}</p>}

        {/* Danh sách Categories (Đã lọc) */}
        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 p-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => {
              // Lấy ID: ưu tiên categoryId
              const categoryId = category.categoryId || category.id;

              // So sánh với prop selectedCategory
              const isActive = selectedCategory === categoryId;

              return (
                <button
                  key={categoryId}
                  onClick={() => onSelectCategory(categoryId)} // Gọi prop onSelectCategory
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left group
                    ${isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/50 bg-transparent"
                    }
                  `}
                >
                  <span className={`material-symbols-outlined transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                    {getCategoryIcon(index)}
                  </span>
                  <p className={`text-sm font-medium leading-normal transition-colors line-clamp-1 ${isActive ? "text-blue-700 dark:text-blue-300 font-bold" : "text-gray-700 dark:text-gray-300"}`}>
                    {getCategoryName(category)}
                  </p>
                  {isActive && (
                    <span className="material-symbols-outlined text-blue-600 text-sm ml-auto">check</span>
                  )}
                </button>
              );
            })
          ) : (
            !error && (
              <p className="text-sm text-gray-500 text-center py-4">
                Không tìm thấy khoa nào khớp với "{searchTerm}".
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;