import React, { useEffect, useState } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { useLanguage } from "../Context/LanguageProvider";
import categoryTranslations from "../../Languages/categoryTranslations";

const FilterSidebar = ({
  selectedCategory,
  onSelectCategory,
  onSearchChange,
}) => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const { texts, language } = useLanguage();

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    try {
      const res = await publicAxios.get("public/categories");
      // Dùng flat() để xử lý nếu dữ liệu trả về là mảng lồng nhau
      const categoryData = res.data.data.flat();
      setCategories(categoryData);
      setError(null);
    } catch (error) {
      console.error(error);
      setCategories([]);
      setError(texts.categoriesError || "Lỗi tải danh mục");
    }
  };

  // Helper: Chọn icon ngẫu nhiên cho đẹp (vì API chưa có field icon)
  const getCategoryIcon = (index) => {
    const icons = [
      "school",
      "account_balance",
      "agriculture",
      "science",
      "computer",
      "biotech",
      "language",
    ];
    return icons[index % icons.length];
  };

  // Helper: Lấy tên hiển thị theo ngôn ngữ
  const getCategoryName = (category) => {
    return categoryTranslations[category.categoryName]
      ? categoryTranslations[category.categoryName][language]
      : category.categoryName;
  };

  return (
        <div className="flex h-full flex-col justify-start bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Header: Tiêu đề bộ lọc */}
            <div className="flex items-center gap-3">
              <div className="text-gray-700 dark:text-gray-200">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "28px" }}
                >
                  filter_list
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal">
                  {texts.categoriesTitle || "Bộ lọc"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                  {texts.filterSubtitle || "Lọc theo danh mục khoa"}
                </p>
              </div>
            </div>

            {/* Input: Tìm kiếm */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                search
              </span>
              <input
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-sm focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-500 text-gray-900 dark:text-white transition-colors"
                placeholder={texts.searchPlaceholder || "Tìm kiếm khoa..."}
                type="text"
                onChange={(e) =>
                  onSearchChange && onSearchChange(e.target.value)
                }
              />
            </div>

            {/* Thông báo lỗi nếu có */}
            {error && (
              <p className="text-red-500 text-sm italic text-center">{error}</p>
            )}

            {/* Danh sách Khoa (Categories List) */}
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 p-2">
              {categories.length > 0
                ? categories.map((category, index) => {
                    const isActive = selectedCategory === category.categoryId;
                    return (
                      <button
                        key={category.categoryId}
                        onClick={() => onSelectCategory(category.categoryId)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left group
                        ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700/50 bg-transparent"
                        }
                      `}
                      >
                        <span
                          className={`material-symbols-outlined transition-colors
                          ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                          }
                        `}
                        >
                          {getCategoryIcon(index)}
                        </span>
                        <p
                          className={`text-sm font-medium leading-normal transition-colors line-clamp-1
                          ${
                            isActive
                              ? "text-blue-700 dark:text-blue-300 font-bold"
                              : "text-gray-700 dark:text-gray-300"
                          }
                        `}
                        >
                          {getCategoryName(category)}
                        </p>

                        {/* Dấu check hiển thị khi active */}
                        {isActive && (
                          <span className="material-symbols-outlined text-blue-600 text-sm ml-auto">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })
                : !error && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {texts.noCategories || "Không có danh mục nào."}
                    </p>
                  )}
            </div>
          </div>
        </div>
  );
};

export default FilterSidebar;
