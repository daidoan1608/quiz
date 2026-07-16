import React, { useEffect, useMemo, useState } from 'react';
import { Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import { subjectApi } from 'api/subjectApi';
import { useFavorites } from 'context/FavoritesContext';
import { useLanguage } from 'context/LanguageProvider';

const subjectIcons = [
  'calculate',
  'science',
  'psychology',
  'experiment',
  'terminal',
  'menu_book',
  'biotech',
  'account_balance',
];

const categoryIcons = [
  'apps',
  'school',
  'science',
  'business_center',
  'computer',
  'local_library',
  'agriculture',
  'biotech',
];

export default function Subject() {
  const { favorites, toggleFavorite } = useFavorites();
  const { texts } = useLanguage();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageSize = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsData, categoriesData] = await Promise.all([
          subjectApi.getPublicSubjects(),
          subjectApi.getPublicCategories(),
        ]);

        setSubjects(subjectsData || []);
        setCategories(categoriesData ? categoriesData.flat() : []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách môn học:', error);
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
      result = result.filter(
        (subject) => subject.categoryId === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const keyword = searchQuery.trim().toLowerCase();
      result = result.filter((subject) =>
        String(subject.name || '')
          .toLowerCase()
          .includes(keyword)
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

  const getCategoryName = (category) =>
    category?.categoryName ||
    category?.name ||
    texts.categoryFallback ||
    'Khoa';

  const getProgress = (subject) => {
    const chapters = subject.totalChapters || 0;
    const exams = subject.totalExams || 0;
    const questions = subject.totalQuestions || 0;
    if (!chapters && !exams && !questions) return 0;
    return Math.min(
      100,
      Math.max(12, chapters * 10 + exams * 8 + Math.round(questions / 8))
    );
  };

  const getStatus = (subject) => {
    if ((subject.totalChapters || 0) > 0 && (subject.totalExams || 0) > 0) {
      return {
        text: texts.ready || 'Sẵn sàng',
        className:
          'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
      };
    }
    if ((subject.totalChapters || 0) > 0) {
      return {
        text: texts.practice || 'Ôn tập',
        className: 'bg-primary/10 text-primary border border-primary/20',
      };
    }
    if ((subject.totalExams || 0) > 0) {
      return {
        text: texts.test || 'Kiểm tra',
        className:
          'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
      };
    }
    return {
      text: texts.unavailable || 'Chưa có',
      className:
        'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    };
  };

  const handleOpenSubject = (subject) => {
    navigate(`/subjects/${subject.subjectId}`, {
      state: { subjectId: subject.subjectId },
    });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setIsMobileSidebarOpen(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          <p className="text-gray-500 font-medium">
            {texts.loadingSubjects || 'Đang tải danh sách môn học...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#151c27] dark:text-gray-100 transition-colors duration-300">
      <main className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:col-span-2 lg:flex-row lg:items-center">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span className="text-gray-900 dark:text-white">
              {texts.subjects || 'MÔN HỌC'}
            </span>
          </nav>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder={texts.placeholder || 'Tìm kiếm môn học...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 lg:hidden"
            >
              <span className="material-symbols-outlined">filter_list</span>
              {texts.filterLabel || 'Bộ lọc'}
            </button>
          </div>
        </div>

        <aside
          className={`${
            isMobileSidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden lg:flex'
          } lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:flex-col lg:gap-1 rounded-xl lg:row-start-2`}
        >
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>

          <div className="relative z-50 flex h-full w-4/5 max-w-xs flex-col gap-1 overflow-y-auto rounded-r-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:h-fit lg:w-full lg:max-w-none lg:rounded-xl lg:shadow-sm">
            <div className="mb-2 px-4 py-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {texts.filterLabel || 'Bộ lọc'}
              </p>
              <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {texts.facultyMajor || 'Khoa / ngành'}
              </h3>
            </div>

            <button
              onClick={clearFilters}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
                !selectedCategory
                  ? 'translate-x-1 bg-primary text-white font-bold shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className="material-symbols-outlined">apps</span>
              <span className="text-sm font-semibold">
                {texts.allSubjects || 'Tất cả môn'}
              </span>
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
                      ? 'translate-x-1 bg-primary text-white font-bold shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {categoryIcons[(index + 1) % categoryIcons.length]}
                  </span>
                  <span className="line-clamp-1 text-sm font-semibold">
                    {getCategoryName(category)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-8 lg:row-start-2">
          {paginatedSubjects.length > 0 ? (
            <section className="grid grid-cols-1 content-start gap-6 md:min-h-[840px] md:grid-cols-2 xl:min-h-[560px] xl:grid-cols-3">
              {paginatedSubjects.map((subject, index) => {
                const progress = getProgress(subject);
                const status = getStatus(subject);
                const isFavorited = favorites.some(
                  (fav) => fav.subjectId === subject.subjectId
                );

                return (
                  <article
                    key={subject.subjectId}
                    onClick={() => handleOpenSubject(subject)}
                    className="subject-card group flex min-h-[260px] cursor-pointer flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[32px]">
                          {subjectIcons[index % subjectIcons.length]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(subject.subjectId, subject.name);
                          }}
                          disabled={!localStorage.getItem('userId')}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
                          title={texts.favorite || 'Yêu thích'}
                        >
                          <span
                            className={`material-symbols-outlined text-xl ${isFavorited ? 'text-red-500' : ''}`}
                            style={{
                              fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}`,
                            }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-gray-950 transition-colors group-hover:text-primary dark:text-white">
                        {subject.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {subject.totalChapters || 0}{' '}
                        {texts.chapters || 'chương'} •{' '}
                        {subject.totalQuestions || 0}{' '}
                        {texts.questions || 'câu hỏi'} •{' '}
                        {subject.totalExams || 0} {texts.examsCount || 'đề thi'}
                      </p>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          {texts.readiness || 'Mức độ sẵn sàng'}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {progress}%
                        </span>
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
              <span className="material-symbols-outlined mb-4 text-6xl text-gray-300">
                search_off
              </span>
              <h3 className="mb-2 text-xl font-black text-gray-950 dark:text-white">
                {texts.noSubjectsFound || 'Không tìm thấy môn học'}
              </h3>
              <p className="mb-5 max-w-sm text-gray-500 dark:text-gray-400">
                {texts.noSubjectsSuggestion ||
                  'Thử đổi từ khóa tìm kiếm hoặc chọn khoa khác để xem thêm môn học.'}
              </p>
              <button
                onClick={clearFilters}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95"
              >
                {texts.viewAllSubjects || 'Xem tất cả môn học'}
              </button>
            </div>
          )}

          {filteredSubjects.length > pageSize && (
            <div className="flex justify-center pt-2">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredSubjects.length}
                onChange={handlePageChange}
                showSizeChanger={false}
                className="aura-pagination"
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
