import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageProvider";
import subjectTranslations from "../../../languages/subjectTranslations";
import { useFavorites } from "../../../context/FavoritesContext";
import { Pagination } from "antd";
import FilterSidebar from "../../User/FilterSidebar";
import FavoritesSidebar from "../../User/FavoritesSidebar";

// --- Component Card Môn học ---
const SubjectCard = ({
  item,
  language,
  isFavorited,
  toggleFavorite,
  handleSelect,
  categoryName,
}) => {
  const translatedName =
    subjectTranslations[item.name]?.[language] || item.name;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/50 hover:border-primary/50 dark:hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2.5 bg-primary/10 text-primary border border-primary/20"
            >
              {categoryName || "Môn học"}
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors leading-snug">
              {translatedName}
            </h3>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.subjectId, item.name);
            }}
            className="focus:outline-none transition-transform active:scale-95 cursor-pointer ml-2 flex-shrink-0"
          >
            <span
              className={`material-symbols-outlined text-2xl transition-colors ${
                isFavorited(item.subjectId)
                  ? "text-red-500 fill-current"
                  : "text-gray-400 hover:text-red-400"
              }`}
              style={{
                fontVariationSettings: `'FILL' ${
                  isFavorited(item.subjectId) ? 1 : 0
                }`,
              }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">
              auto_stories
            </span>
            {item.totalChapters || 0} chương
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">quiz</span>
            {item.totalExams || 0} đề thi
          </span>
        </div>

        <button
          onClick={() => item.totalExams > 0 && handleSelect(item.subjectId)}
          disabled={!item.totalExams || item.totalExams === 0}
          className={`w-full h-10 px-4 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md hover:shadow-lg
            ${
              item.totalExams > 0
                ? "bg-primary text-white hover:bg-primary-dark hover:shadow-primary/20"
                : "bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500 cursor-not-allowed shadow-none"
            }
          `}
        >
          {item.totalExams > 0 ? "Chọn môn thi" : "Chưa có đề"}
        </button>
      </div>
    </div>
  );
};

export default function ChooseExam() {
  // --- STATE ---
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]); // State chứa danh sách Khoa
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // --- HOOKS ---
  const navigate = useNavigate();
  const { texts, language } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();

  // --- EFFECT: Load Data (Subjects + Categories) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Gọi API Subjects
        const subResp = await publicAxios.get("/public/subjects");
        setSubjects(subResp.data.data || []);
        setFilteredSubjects(subResp.data.data || []);

        // 2. Gọi API Categories (Khoa)
        const catResp = await publicAxios.get("/public/categories");
        const catData = catResp.data.data ? catResp.data.data.flat() : [];
        setCategories(catData);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = subjects;
    if (selectedCategory) {
      result = result.filter(
        (subj) => subj.categoryId === selectedCategory
      );
    } else if (searchQuery.trim()) {
      result = result.filter((subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredSubjects(result);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, subjects]);

  // --- Helper: Lấy tên khoa theo ID ---
  const getCategoryNameById = (catId) => {
    if (!catId) return "";
    const cat = categories.find((c) => (c.categoryId || c.id) === catId);
    return cat ? cat.categoryName || cat.name : "";
  };

  // --- HANDLERS ---
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    setSidebarOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFilteredSubjects(subjects);
    setCurrentPage(1);
  };

  const handleSelectExamBySubjectId = (subjectId) => {
    navigate(`/list-exam`, { state: { subjectId } });
  };

  const isFavorited = (subjectId) => {
    return favorites.some((fav) => fav.subjectId === subjectId);
  };

  // --- PAGINATION ---
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <main className="w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Nút Mobile Sidebar Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg shadow-sm text-gray-700 dark:text-white"
          >
            <span className="material-symbols-outlined">filter_list</span>
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* --- GRID LAYOUT 3 CỘT --- */}
        <div className="grid grid-cols-12 gap-6 relative items-start">
          {/* 1. LEFT SIDEBAR (Filter) - 3 cột */}
          <aside
            className={`
              lg:col-span-3
              ${
                sidebarOpen
                  ? "fixed inset-0 z-50 flex"
                  : "hidden lg:block"
              }
              lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:custom-scrollbar lg:z-0
            `}
          >
            {/* Overlay Mobile */}
            <div
              className="fixed inset-0 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Content Sidebar */}
            <div className="relative w-4/5 max-w-xs lg:w-full bg-white dark:bg-transparent h-full lg:h-auto overflow-y-auto lg:overflow-visible z-50 lg:z-auto">
              <FilterSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                onSearchChange={(val) => {
                  setSearchQuery(val);
                  setSelectedCategory(null);
                }}
              />
            </div>
          </aside>

          {/* 2. CENTER CONTENT (Subjects) - 6 cột */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            {/* Header & Search */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                Tất cả môn thi
              </h2>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder={texts.placeholder || "Tìm kiếm môn học..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all"
                />
              </div>
            </section>

            {/* Grid Môn học */}
            <div className="mb-4">
              {paginatedSubjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedSubjects.map((item) => (
                    <SubjectCard
                      key={item.subjectId}
                      item={item}
                      language={language}
                      isFavorited={isFavorited}
                      toggleFavorite={toggleFavorite}
                      handleSelect={handleSelectExamBySubjectId}
                      categoryName={getCategoryNameById(item.categoryId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                    search_off
                  </span>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {texts.noSubjects || "Không tìm thấy môn học nào."}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-primary hover:underline font-medium cursor-pointer"
                  >
                    Xóa bộ lọc để xem tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Pagination (Ant Design) */}
            {filteredSubjects.length > pageSize && (
              <div className="flex justify-center mt-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredSubjects.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="dark:text-white"
                />
              </div>
            )}
          </div>

          {/* 3. RIGHT SIDEBAR (Favorites) - 3 cột */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            <FavoritesSidebar favoriteList={favorites} />
          </aside>
        </div>
      </main>
    </div>
  );
}
