import React, { useState, useEffect, useCallback } from 'react';
import { examApi } from 'api/examApi';
import { useLanguage } from 'context/LanguageProvider';
import { useAuth } from 'context/AuthProvider';
import { getCurrentUserId } from 'utils/storage';

export default function Rank() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE QUẢN LÝ BỘ LỌC UI ---
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [filterCriteria, setFilterCriteria] = useState('total'); // 'total' (Tổng điểm) | 'avg' (Điểm trung bình)
  const [openSelect, setOpenSelect] = useState(null);

  // --- CONTEXT ---
  const { isLoggedIn, user } = useAuth();
  const { texts } = useLanguage();
  const currentUserId = user || getCurrentUserId();

  const normalizeText = (value) =>
    (value || '').toString().trim().toLowerCase();
  const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  // --- 1. FETCH & PROCESS DỮ LIỆU ---
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await examApi.getRankings({
        params: { period: timeFilter },
      });
      const result = response.data;

      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to fetch data');
      }

      const sourceData = Array.isArray(result.data) ? result.data : [];
      setAllSubjects(
        [
          ...new Set(
            sourceData
              .flatMap((item) => (item.subjectName || '').split(','))
              .map((subject) => subject.trim())
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b, 'vi'))
      );

      let filtered = sourceData;

      // 1. Lọc theo môn học
      if (selectedSubject !== 'all') {
        filtered = filtered.filter((item) =>
          normalizeText(item.subjectName).includes(
            normalizeText(selectedSubject)
          )
        );
      }

      // 2. Map dữ liệu & Chọn điểm hiển thị theo tiêu chí
      const updated = filtered.map((item) => {
        // Lấy giá trị điểm dựa trên tiêu chí đang chọn
        const scoreValue =
          filterCriteria === 'avg'
            ? toNumber(item.avgScore)
            : toNumber(item.totalScore);

        return {
          userId: item.userId?.toString(),
          username: item.username || texts.unknownUser || 'Người dùng',
          avatarUrl: item.avatarUrl,
          // Lưu cả 2 loại điểm để hiển thị tooltip nếu cần
          totalScore: toNumber(item.totalScore),
          avgScore: toNumber(item.avgScore),
          // Điểm dùng để xếp hạng và hiển thị chính
          score: scoreValue,
          subject: item.subjectName,
          attemptCount: item.attemptCount,
        };
      });

      // 3. Sắp xếp giảm dần theo điểm đã chọn
      const ranked = updated
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

      setLeaderboardData(ranked);

      // 4. Tìm thứ hạng của user hiện tại
      if (currentUserId) {
        const foundRank = ranked.find(
          (item) => item.userId?.toString() === currentUserId?.toString()
        );
        setUserRank(foundRank ? foundRank.rank : null);
      } else {
        setUserRank(null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentUserId,
    selectedSubject,
    filterCriteria,
    timeFilter,
    texts.unknownUser,
  ]);

  // Gọi lại hàm xử lý khi bất kỳ điều kiện lọc nào thay đổi
  useEffect(() => {
    fetchLeaderboardData();
  }, [isLoggedIn, fetchLeaderboardData]); // Thêm filterCriteria vào dependency

  const subjectOptions = allSubjects;
  const criteriaOptions = [
    { value: 'total', label: texts.accumulatedScore || 'Tổng điểm tích lũy' },
    { value: 'avg', label: texts.averageScoreFull || 'Điểm trung bình' },
  ];
  const subjectSelectOptions = [
    { value: 'all', label: texts.allSubjectOption || 'Tất cả môn học' },
    ...subjectOptions.map((subject) => ({ value: subject, label: subject })),
  ];

  const CustomSelect = ({ id, value, options, onChange }) => {
    const selected =
      options.find((option) => option.value === value) || options[0];
    const isOpen = openSelect === id;

    return (
      <div
        className="relative"
        tabIndex={0}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setOpenSelect(null);
          }
        }}
      >
        <button
          type="button"
          onClick={() => setOpenSelect(isOpen ? null : id)}
          className={`w-full min-h-12 rounded-2xl border bg-white dark:bg-gray-700/90 pl-4 pr-12 text-left text-base font-semibold text-gray-900 dark:text-white transition-all shadow-sm cursor-pointer
            ${
              isOpen
                ? 'border-primary ring-4 ring-primary/15 shadow-md'
                : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:shadow-md'
            }
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="block truncate">{selected?.label}</span>
          <span
            className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-all dark:bg-primary/15 ${isOpen ? 'rotate-180 bg-primary/15' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              expand_more
            </span>
          </span>
        </button>

        {isOpen && (
          <div
            className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 shadow-2xl shadow-gray-900/10 dark:shadow-black/40 animate-[fadeIn_0.12s_ease-out]"
            role="listbox"
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(option.value);
                    setOpenSelect(null);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors
                    ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15'
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {active && (
                    <span className="material-symbols-outlined text-[18px] leading-none">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // --- HELPER RENDERING ---
  const renderRankIcon = (rank) => {
    if (rank === 1)
      return (
        <span className="material-symbols-outlined text-2xl text-yellow-400 drop-shadow-sm">
          emoji_events
        </span>
      );
    if (rank === 2)
      return (
        <span className="material-symbols-outlined text-2xl text-gray-400 drop-shadow-sm">
          emoji_events
        </span>
      );
    if (rank === 3)
      return (
        <span className="material-symbols-outlined text-2xl text-orange-400 drop-shadow-sm">
          emoji_events
        </span>
      );
    return null;
  };

  const getRankNumberStyle = (rank) => {
    if (rank <= 3) return 'text-xl font-black text-gray-800 dark:text-gray-100';
    return 'text-base font-medium text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark font-display transition-colors duration-300">
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Header Trang */}
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                {texts.rankings || 'Bảng Xếp Hạng Thành Tích'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                {texts.rankingSubtitle ||
                  'Cùng xem ai đang dẫn đầu trong các thử thách trắc nghiệm!'}
              </p>
            </div>

            {userRank && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {texts.yourRank || 'Thứ hạng của bạn'}:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  #{userRank}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* SIDEBAR BỘ LỌC */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-100/70 dark:shadow-black/10 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {texts.rankingFilter || 'Lọc Bảng Xếp Hạng'}
                </h3>
                <div className="space-y-6">
                  {/* Lọc Thời gian */}
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                      {texts.timeFilter || 'Thời gian'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { id: 'week', label: texts.thisWeek || 'Tuần này' },
                        { id: 'month', label: texts.thisMonth || 'Tháng này' },
                        { id: 'all', label: texts.all || 'Tất cả' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setTimeFilter(item.id)}
                          className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 border
                            ${
                              timeFilter === item.id
                                ? 'bg-primary text-white shadow-md shadow-primary/20 border-primary scale-[1.02]'
                                : 'bg-gray-50 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                            }
                          `}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lọc Tiêu chí (Tổng điểm / Điểm TB) */}
                  <div>
                    <label className="flex flex-col w-full">
                      <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                        {texts.rankingCriteria || 'Tiêu chí xếp hạng'}
                      </p>
                      <CustomSelect
                        id="criteria"
                        value={filterCriteria}
                        options={criteriaOptions}
                        onChange={setFilterCriteria}
                      />
                    </label>
                  </div>

                  {/* Lọc Môn học */}
                  <div>
                    <label className="flex flex-col w-full">
                      <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                        {texts.subject || 'Môn học'}
                      </p>
                      <CustomSelect
                        id="subject"
                        value={selectedSubject}
                        options={subjectSelectOptions}
                        onChange={setSelectedSubject}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* DANH SÁCH XẾP HẠNG */}
            <main className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="col-span-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-2">
                    {texts.rankHeader || 'Hạng'}
                  </div>
                  <div className="col-span-6 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {texts.userHeader || 'Người dùng'}
                  </div>
                  <div className="col-span-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {filterCriteria === 'total'
                      ? texts.totalScoreShort || 'Tổng điểm'
                      : texts.avgScoreShort || 'Điểm TB'}
                  </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoading ? (
                    <div className="py-20 text-center">
                      <div
                        className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                        role="status"
                        aria-label="loading"
                      ></div>
                    </div>
                  ) : leaderboardData.length > 0 ? (
                    leaderboardData.map((item) => {
                      const isCurrentUser =
                        item.userId?.toString() === currentUserId?.toString();

                      return (
                        <div
                          key={item.userId}
                          className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-all duration-200
                            ${
                              isCurrentUser
                                ? 'bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/50 dark:ring-primary/40 rounded-lg m-2 relative z-10 shadow-sm'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                            }
                          `}
                        >
                          <div className="col-span-2 flex items-center gap-3">
                            <p
                              className={`w-8 text-center ${getRankNumberStyle(
                                item.rank
                              )}`}
                            >
                              {item.rank}
                            </p>
                            {renderRankIcon(item.rank)}
                          </div>

                          <div className="col-span-6 flex items-center gap-4">
                            <div
                              className={`bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-gray-200 dark:border-gray-600
                                ${
                                  isCurrentUser
                                    ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800'
                                    : ''
                                }
                              `}
                              style={{
                                backgroundImage: `url("${
                                  item.avatarUrl ||
                                  'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                                }")`,
                              }}
                            ></div>
                            <div className="flex flex-col min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  isCurrentUser
                                    ? 'font-bold text-gray-900 dark:text-white'
                                    : 'font-medium text-gray-900 dark:text-white'
                                }`}
                              >
                                {item.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                                {item.subject} • {item.attemptCount}{' '}
                                {texts.examAttemptUnit || 'bài thi'}
                              </p>
                            </div>
                          </div>

                          <div className="col-span-4 text-right">
                            <p
                              className={`text-base ${
                                isCurrentUser
                                  ? 'font-black text-primary dark:text-blue-400'
                                  : 'font-bold text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {/* Format điểm số thập phân */}
                              {Number(item.score).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center text-gray-500 dark:text-gray-400">
                      {texts.noResultMessage || 'Chưa có dữ liệu xếp hạng.'}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
