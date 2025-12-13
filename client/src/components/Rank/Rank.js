import React, { useState, useEffect } from "react";
import { publicAxios } from "../../api/axiosConfig";
import { useLanguage } from "../Context/LanguageProvider";
import { useAuth } from "../Context/AuthProvider";

export default function Rank() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE QUẢN LÝ BỘ LỌC UI ---
  const [selectedSubject, setSelectedSubject] = useState("Tất cả");
  const [timeFilter, setTimeFilter] = useState("all");
  const [filterCriteria, setFilterCriteria] = useState("total"); // 'total' (Tổng điểm) | 'avg' (Điểm trung bình)

  // --- CONTEXT ---
  const { isLoggedIn, user } = useAuth();
  const { texts } = useLanguage();

  // --- 1. FETCH & PROCESS DỮ LIỆU ---
  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const response = await publicAxios.get("/public/summaries");
      const result = response.data;

      if (result.status !== "success") {
        throw new Error(result.message || "Lỗi lấy dữ liệu");
      }

      let filtered = result.data || [];

      // 1. Lọc theo môn học
      if (selectedSubject !== "Tất cả") {
        filtered = filtered.filter((item) =>
          item.subjectName.includes(selectedSubject)
        );
      }

      // 2. Map dữ liệu & Chọn điểm hiển thị theo tiêu chí
      const updated = filtered.map((item) => {
        // Lấy giá trị điểm dựa trên tiêu chí đang chọn
        const scoreValue =
          filterCriteria === "avg"
            ? Number(item.avgScore)
            : Number(item.totalScore);

        return {
          userId: item.userId,
          username: item.username,
          avatarUrl: item.avatarUrl,
          // Lưu cả 2 loại điểm để hiển thị tooltip nếu cần
          totalScore: Number(item.totalScore),
          avgScore: Number(item.avgScore),
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
      if (user) {
        const foundRank = ranked.find((item) => item.userId === user);
        setUserRank(foundRank ? foundRank.rank : null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi lại hàm xử lý khi bất kỳ điều kiện lọc nào thay đổi
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchLeaderboardData();
    }
  }, [isLoggedIn, user, selectedSubject, filterCriteria]); // Thêm filterCriteria vào dependency

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
    if (rank <= 3) return "text-xl font-black text-gray-800 dark:text-gray-100";
    return "text-base font-medium text-gray-600 dark:text-gray-400";
  };


  return (
    <div className="flex h-full grow flex-col bg-background-light dark:bg-background-dark min-h-screen font-display transition-colors duration-300">
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Header Trang */}
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                {texts.rankings || "Bảng Xếp Hạng Thành Tích"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                Cùng xem ai đang dẫn đầu trong các thử thách trắc nghiệm!
              </p>
            </div>

            {userRank && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Thứ hạng của bạn:
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
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Lọc Bảng Xếp Hạng
                </h3>
                <div className="space-y-6">
                  {/* Lọc Thời gian (UI Only) */}
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                      Thời gian
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { id: "week", label: "Tuần này" },
                        { id: "month", label: "Tháng này" },
                        { id: "all", label: "Tất cả" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setTimeFilter(item.id)}
                          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 cursor-pointer text-sm font-medium transition-colors
                            ${
                              timeFilter === item.id
                                ? "bg-primary text-white shadow-md font-bold"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                        Tiêu chí xếp hạng
                      </p>
                      <select
                        className="form-select w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-primary h-12 px-3 text-base"
                        value={filterCriteria}
                        onChange={(e) => setFilterCriteria(e.target.value)}
                      >
                        <option value="total">Tổng điểm tích lũy</option>
                        <option value="avg">Điểm trung bình</option>
                      </select>
                    </label>
                  </div>

                  {/* Lọc Môn học */}
                  <div>
                    <label className="flex flex-col w-full">
                      <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                        Môn học
                      </p>
                      <select
                        className="form-select w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-primary h-12 px-3 text-base"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                      >
                        <option value="Tất cả">Tất cả môn học</option>
                        <option value="Nguyên lý hệ điều hành">
                          Nguyên lý hệ điều hành
                        </option>
                        <option value="Tin học cơ sở">Tin học cơ sở</option>
                        {/* Thêm các option khác */}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* DANH SÁCH XẾP HẠNG */}
            <main className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm min-h-[400px]">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="col-span-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-2">
                    Hạng
                  </div>
                  <div className="col-span-6 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Người dùng
                  </div>
                  <div className="col-span-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {filterCriteria === "total" ? "Tổng điểm" : "Điểm TB"}
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
                      const isCurrentUser = item.userId === user;

                      return (
                        <div
                          key={item.userId}
                          className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-all duration-200
                            ${
                              isCurrentUser
                                ? "bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/50 dark:ring-primary/40 rounded-lg m-2 relative z-10 shadow-sm"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
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
                                    ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800"
                                    : ""
                                }
                              `}
                              style={{
                                backgroundImage: `url("${
                                  item.avatarUrl ||
                                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                                }")`,
                              }}
                            ></div>
                            <div className="flex flex-col min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  isCurrentUser
                                    ? "font-bold text-gray-900 dark:text-white"
                                    : "font-medium text-gray-900 dark:text-white"
                                }`}
                              >
                                {item.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                                {item.subject} • {item.attemptCount} bài thi
                              </p>
                            </div>
                          </div>

                          <div className="col-span-4 text-right">
                            <p
                              className={`text-base ${
                                isCurrentUser
                                  ? "font-black text-primary dark:text-blue-400"
                                  : "font-bold text-gray-700 dark:text-gray-300"
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
                      {texts.noResultMessage || "Chưa có dữ liệu xếp hạng."}
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
