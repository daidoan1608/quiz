import React, { useEffect, useState } from "react";
import { publicAxios } from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageProvider";
import subjectTranslations from "../../../languages/subjectTranslations";
import { useFavorites } from "../../../context/FavoritesContext";
import { Pagination } from "antd";

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

  // Random màu sắc cho tag dựa trên ID
  const colors = [
    {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      bg: "bg-green-100 dark:bg-green-900/50",
      text: "text-green-600 dark:text-green-400",
    },
    {
      bg: "bg-orange-100 dark:bg-orange-900/50",
      text: "text-orange-600 dark:text-orange-400",
    },
    {
      bg: "bg-purple-100 dark:bg-purple-900/50",
      text: "text-purple-600 dark:text-purple-400",
    },
  ];
  const color = colors[item.subjectId % colors.length];

  return (
    <div className="group bg-white dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50 transition-all hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            {/* Hiển thị tên Khoa lấy từ props truyền vào */}
            <span
              className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mb-2 ${color.bg} ${color.text}`}
            >
              {categoryName || "Môn học"}
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
              {translatedName}
            </h3>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.subjectId, item.name);
            }}
            className="focus:outline-none transition-transform active:scale-95"
          >
            <span
              className={`material-symbols-outlined text-2xl ${
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

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">
              auto_stories
            </span>
            {item.totalChapters || 0} chương
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">quiz</span>
            {item.totalExams || 0} đề
          </span>
        </div>

        <button
          // 1. Chỉ gọi hàm handleSelect nếu có đề
          onClick={() => item.totalExams > 0 && handleSelect(item.subjectId)}
          // 2. Disable nút nếu 0 đề
          disabled={!item.totalExams || item.totalExams === 0}
          className={`w-full h-10 px-4 flex items-center justify-center rounded-lg text-sm font-bold transition-all shadow-md
            ${
              item.totalExams > 0
                ? "bg-primary text-white hover:bg-blue-600 hover:shadow-lg cursor-pointer"
                : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed shadow-none"
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
  const [selectedCategory, setSelectedCategory] = useState("all");
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
        // Xử lý dữ liệu category (có thể cần .flat() nếu BE trả về lồng nhau)
        const catData = catResp.data.data ? catResp.data.data.flat() : [];
        setCategories(catData);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };
    fetchData();
  }, []);

  // --- Helper: Lấy tên khoa theo ID ---
  const getCategoryNameById = (catId) => {
    if (!catId) return "";
    const cat = categories.find((c) => (c.categoryId || c.id) === catId);
    return cat ? cat.categoryName || cat.name : "";
  };

  // --- HANDLERS ---
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, selectedCategory);
  };

  const handleSelectCategory = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    applyFilters(searchQuery, categoryId);
  };

  const applyFilters = (search, category) => {
    let result = subjects;

    // Lọc theo search
    if (search) {
      result = result.filter((subject) =>
        subject.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Lọc theo category
    if (category !== "all") {
      result = result.filter(
        (subject) => String(subject.categoryId) === String(category)
      );
    }

    setFilteredSubjects(result);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
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
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8">
        {/* Nút mở Sidebar Mobile */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-sm font-medium"
          >
            <span className="material-symbols-outlined">filter_list</span>
            Bộ lọc & Tìm kiếm
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- SIDEBAR (Left) --- */}
          <aside
            className={`
            fixed inset-y-0 left-0 z-50 w-72 lg:bg-transparent shadow-2xl lg:shadow-none p-6 lg:p-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-1/4 lg:max-w-xs shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                <div className="flex justify-between items-center mb-4 lg:hidden">
                  <h3 className="text-lg font-bold">Bộ lọc</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-4 hidden lg:block">
                  {texts.searchFilter || "Tìm kiếm & Lọc"}
                </h3>

                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      htmlFor="faculty"
                    >
                      {texts.faculty || "Khoa"}
                    </label>
                    <select
                      id="faculty"
                      value={selectedCategory}
                      onChange={handleSelectCategory}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-primary text-sm h-10"
                    >
                      <option value="all">
                        {texts.allFaculties || "Tất cả các khoa"}
                      </option>

                      {/* MAP DANH SÁCH CATEGORIES TỪ API */}
                      {categories.map((cat) => (
                        <option
                          key={cat.categoryId || cat.id}
                          value={cat.categoryId || cat.id}
                        >
                          {cat.categoryName || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={clearFilters}
                    className="w-full h-10 px-4 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {texts.clearFilter || "Xóa bộ lọc"}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Overlay cho mobile sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* --- MAIN CONTENT (Right) --- */}
          <div className="w-full lg:w-3/4">
            {/* Header + Search Bar */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">
                  {texts.chooseSubject || "Chọn môn thi của bạn"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                  {texts.subtitle ||
                    "Tìm kiếm và lựa chọn môn học để bắt đầu ôn tập."}
                </p>
              </div>

              <div className="w-full md:w-auto md:min-w-80">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                    <div className="text-gray-500 flex items-center justify-center pl-4">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      type="text"
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-none focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 pl-3 text-sm font-normal"
                      placeholder={texts.placeholder || "Tìm kiếm môn học..."}
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Grid Môn học */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 text-gray-900 dark:text-white">
                {filteredSubjects.length > 0
                  ? searchQuery
                    ? `Kết quả tìm kiếm (${filteredSubjects.length})`
                    : texts.allSubjects || "Danh sách môn học"
                  : ""}
              </h2>

              {paginatedSubjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedSubjects.map((item) => (
                    <SubjectCard
                      key={item.subjectId}
                      item={item}
                      language={language}
                      isFavorited={isFavorited}
                      toggleFavorite={toggleFavorite}
                      handleSelect={handleSelectExamBySubjectId}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                    search_off
                  </span>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {texts.noSubjects || "Không tìm thấy môn học nào."}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-primary hover:underline font-medium"
                  >
                    Xóa bộ lọc để xem tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Pagination (Ant Design) */}
            {filteredSubjects.length > pageSize && (
              <div className="flex justify-center mt-8">
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
        </div>
      </main>
    </div>
  );
}
