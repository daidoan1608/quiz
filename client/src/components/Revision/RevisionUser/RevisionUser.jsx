import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../../api/axiosConfig";
import { useFavorites } from "../../../context/FavoritesContext";
import { useLanguage } from "../../../context/LanguageProvider";
import subjectTranslations from "../../../languages/subjectTranslations";

const subjectIcons = [
  "calculate",
  "science",
  "psychology",
  "experiment",
  "terminal",
  "menu_book",
  "biotech",
  "account_balance",
];

const categoryIcons = [
  "apps",
  "school",
  "science",
  "business_center",
  "computer",
  "local_library",
  "agriculture",
  "biotech",
];

export default function RevisionUser() {
  const { favorites, toggleFavorite } = useFavorites();
  const { texts, language } = useLanguage();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageSize = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsResp, categoriesResp] = await Promise.all([
          publicAxios.get("/public/subjects"),
          publicAxios.get("/public/categories"),
        ]);

        setSubjects(subjectsResp.data.data || []);
        setCategories(categoriesResp.data.data ? categoriesResp.data.data.flat() : []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách môn học:", error);
        setSubjects([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    let result = subjects;

    if (selectedCategory) {
      result = result.filter((subject) => subject.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const keyword = searchQuery.trim().toLowerCase();
      result = result.filter((subject) =>
        String(subject.name || "").toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [subjects, selectedCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getCategoryName = (category) => category?.categoryName || category?.name || "Khoa";

  const getProgress = (subject) => {
    const chapters = subject.totalChapters || 0;
    const exams = subject.totalExams || 0;
    const questions = subject.totalQuestions || 0;
    if (!chapters && !exams && !questions) return 0;
    return Math.min(100, Math.max(12, chapters * 10 + exams * 8 + Math.round(questions / 8)));
  };

  const getStatus = (subject) => {
    if ((subject.totalChapters || 0) > 0 && (subject.totalExams || 0) > 0) {
      return { text: "Sẵn sàng", className: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20" };
    }
    if ((subject.totalChapters || 0) > 0) {
      return { text: "Ôn tập", className: "bg-primary/10 text-primary border border-primary/20" };
    }
    if ((subject.totalExams || 0) > 0) {
      return { text: "Kiểm tra", className: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20" };
    }
    return { text: "Chưa có", className: "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" };
  };

  const handleOpenSubject = (subject) => {
    navigate(`/subjects/${subject.subjectId}`, { state: { subjectId: subject.subjectId } });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setIsMobileSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#f9f9ff] dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          <p className="text-gray-500 font-medium">Đang tải danh sách môn học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col bg-background-light text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-gray-100">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <span className="font-bold uppercase tracking-wide text-gray-900 dark:text-white">Môn học</span>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="max-w-[260px] truncate font-bold text-gray-900 dark:text-white">Ôn tập</span>
          </nav>

          <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6 md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-base">menu_book</span>
                Ôn tập theo môn học
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">Chọn môn học để ôn tập</h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    Lọc theo khoa/ngành, tìm kiếm môn học và bắt đầu ôn luyện với bố cục đồng bộ như trang làm bài thi thử.
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-5 py-4 text-right text-primary">
                  <p className="text-xs font-bold uppercase tracking-wide">Tổng môn</p>
                  <p className="text-3xl font-black">{filteredSubjects.length}/{subjects.length}</p>
                </div>
              </div>
              <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${subjects.length ? (filteredSubjects.length / subjects.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </section>

          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-base text-primary">dashboard</span>
              <span className="font-bold text-gray-900 dark:text-white">Danh sách môn học</span>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder={texts.placeholder || "Tìm kiếm môn học..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 lg:hidden"
            >
              <span className="material-symbols-outlined">filter_list</span>
              Bộ lọc
            </button>
          </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
        <aside
          className={`${
            isMobileSidebarOpen ? "fixed inset-0 z-50 flex" : "hidden lg:flex"
          } col-span-12 lg:sticky lg:top-24 lg:h-fit lg:flex-col lg:gap-1 lg:col-span-3`}
        >
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>

          <div className="relative z-50 flex h-full w-4/5 max-w-xs flex-col gap-1 overflow-y-auto rounded-r-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:h-fit lg:w-full lg:max-w-none lg:rounded-2xl lg:shadow-sm">
            <div className="mb-2 px-4 py-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Bộ lọc</p>
              <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Khoa / ngành</h3>
            </div>

            <button
              onClick={clearFilters}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
                !selectedCategory
                  ? "translate-x-1 bg-primary text-white font-bold shadow-md"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <span className="material-symbols-outlined">apps</span>
              <span className="text-sm font-semibold">Tất cả môn</span>
            </button>

            {categories.map((category, index) => {
              const categoryId = category.categoryId || category.id;
              const active = selectedCategory === categoryId;
              return (
                <button
                  key={categoryId}
                  onClick={() => {
                    setSelectedCategory(categoryId);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
                    active
                      ? "translate-x-1 bg-primary text-white font-bold shadow-md"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {categoryIcons[(index + 1) % categoryIcons.length]}
                  </span>
                  <span className="line-clamp-1 text-sm font-semibold">{getCategoryName(category)}</span>
                </button>
              );
            })}

            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                onClick={() => paginatedSubjects[0] && handleOpenSubject(paginatedSubjects[0])}
                disabled={!paginatedSubjects[0]}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">bolt</span>
                Học nhanh
              </button>
            </div>
          </div>
        </aside>

        <section className="col-span-12 flex min-w-0 flex-1 flex-col gap-8 lg:col-span-9">
          {paginatedSubjects.length > 0 ? (
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedSubjects.map((subject, index) => {
                const translatedName = subjectTranslations[subject.name]?.[language] || subject.name;
                const progress = getProgress(subject);
                const status = getStatus(subject);
                const isFavorited = favorites.some((fav) => fav.subjectId === subject.subjectId);

                return (
                  <article
                    key={subject.subjectId}
                    onClick={() => handleOpenSubject(subject)}
                    className="subject-card group flex min-h-[260px] cursor-pointer flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[32px]">
                          {subjectIcons[index % subjectIcons.length]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
                          {status.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(subject.subjectId, subject.name);
                          }}
                          disabled={!localStorage.getItem("userId")}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
                          title="Yêu thích"
                        >
                          <span
                            className={`material-symbols-outlined text-xl ${isFavorited ? "text-red-500" : ""}`}
                            style={{ fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}` }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-gray-950 transition-colors group-hover:text-primary dark:text-white">
                        {translatedName}
                      </h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {subject.totalChapters || 0} chương • {subject.totalQuestions || 0} câu hỏi • {subject.totalExams || 0} đề thi
                      </p>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Mức độ sẵn sàng</span>
                        <span className="text-sm font-bold text-primary">{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700 group-hover:brightness-110"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
              <span className="material-symbols-outlined mb-4 text-6xl text-gray-300">search_off</span>
              <h3 className="mb-2 text-xl font-black text-gray-950 dark:text-white">Không tìm thấy môn học</h3>
              <p className="mb-5 max-w-sm text-gray-500 dark:text-gray-400">
                Thử đổi từ khóa tìm kiếm hoặc chọn khoa khác để xem thêm môn học.
              </p>
              <button
                onClick={clearFilters}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95"
              >
                Xem tất cả môn học
              </button>
            </div>
          )}

          {filteredSubjects.length > pageSize && (
            <div className="flex justify-center pt-2">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredSubjects.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                className="dark:text-white"
              />
            </div>
          )}
        </section>
          </div>
        </div>
      </main>
    </div>
  );
}
