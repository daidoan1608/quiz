import React, { useEffect, useState } from "react";
import { useFavorites } from "../../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageProvider";
import { publicAxios } from "../../../api/axiosConfig";
import { Pagination } from "antd";

// Import 2 Sidebar
import FilterSidebar from "../../User/FilterSidebar";
import FavoritesSidebar from "../../User/FavoritesSidebar";

export default function RevisionUser() {
  const { favorites, toggleFavorite } = useFavorites();
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { texts } = useLanguage();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const getAllSubjects = async () => {
      try {
        const resp = await publicAxios.get("/public/subjects");
        setSubjects(resp.data.data || []);
        setFilteredSubjects(resp.data.data || []);
      } catch (error) {
        setSubjects([]);
        setFilteredSubjects([]);
      }
    };
    getAllSubjects();
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let filtered = subjects;
    if (selectedCategory) {
      filtered = filtered.filter(
        (subj) => subj.categoryId === selectedCategory
      );
    } else if (searchQuery.trim()) {
      filtered = filtered.filter((subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredSubjects(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, subjects]);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    setIsMobileSidebarOpen(false);
  };

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getCoverImage = (index) => {
    const images = [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=500&q=60",
    ];
    return images[index % images.length];
  };

  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <main className="w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Nút Mobile Sidebar Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg shadow-sm text-gray-700 dark:text-white"
          >
            <span className="material-symbols-outlined">filter_list</span>
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* --- GRID LAYOUT 3 CỘT --- */}
        {/* QUAN TRỌNG: Thêm 'items-start' để sticky hoạt động đúng */}
        <div className="grid grid-cols-12 gap-6 relative items-start">
          {/* 1. LEFT SIDEBAR (Filter) - 3 cột */}
          <aside
            className={`
              lg:col-span-3
              ${
                isMobileSidebarOpen
                  ? "fixed inset-0 z-50 flex"
                  : "hidden lg:block"
              }
              /* Class cho Desktop Sticky */
              lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:custom-scrollbar lg:z-0
            `}
          >
            {/* Overlay Mobile */}
            <div
              className="fixed inset-0 bg-black/50 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
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
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-6 min-h-[calc(100vh-200px)]">
            {/* Header & Search */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                Tất cả môn học
              </h2>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder={texts.placeholder || "Tìm kiếm..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-blue-600 text-sm"
                />
              </div>
            </section>

            {/* Grid Môn học */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedSubjects.length > 0 ? (
                paginatedSubjects.map((item, index) => {
                  const isFavorited = favorites.some(
                    (fav) => fav.subjectId === item.subjectId
                  );
                  return (
                    <div
                      key={item.subjectId}
                      className="flex flex-col rounded-xl bg-white dark:bg-gray-800/50 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-400 transition-all duration-300 group"
                    >
                      <div
                        className="w-full h-32 bg-center bg-no-repeat bg-cover rounded-t-xl relative overflow-hidden"
                        style={{
                          backgroundImage: `url('${getCoverImage(index)}')`,
                        }}
                      >
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      </div>
                      <div className="flex flex-col flex-1 justify-between p-4 gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-gray-900 dark:text-white text-base font-bold line-clamp-2">
                            {item.name}
                          </h3>
                          <button
                            onClick={() =>
                              toggleFavorite(item.subjectId, item.name)
                            }
                            disabled={!localStorage.getItem("userId")}
                            className={`flex items-center justify-center size-8 rounded-full flex-shrink-0 transition-colors ${
                              isFavorited
                                ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span
                              className="material-symbols-outlined text-lg"
                              style={{
                                fontVariationSettings: `'FILL' ${
                                  isFavorited ? 1 : 0
                                }`,
                              }}
                            >
                              favorite
                            </span>
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/listChap`, {
                              state: { subjectId: item.subjectId },
                            })
                          }
                          className="w-full rounded-lg h-9 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                          Chọn chương
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500">
                  Không tìm thấy môn học nào.
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredSubjects.length > pageSize && (
              <div className="flex justify-center mt-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredSubjects.length}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
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
