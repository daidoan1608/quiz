import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicAxios } from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthProvider";
import { useFavorites } from "../../../context/FavoritesContext";
import LoginPrompt from "../../modal/LoginPrompt";

export default function RevisionListChap() {
  // --- STATE ---
  const [subjectData, setSubjectData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // --- HOOKS ---
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId } = location.state || {};
  const { isLoggedIn } = useAuth();

  // Favorites Logic
  const { favorites, toggleFavorite } = useFavorites();
  // Check an toàn khi subjectData chưa load xong
  const isFavorited = subjectData
    ? favorites.some((fav) => fav.subjectId === subjectData.subjectId)
    : false;

  // --- 1. Fetch Dữ liệu ---
  useEffect(() => {
    if (!subjectId) {
      setError("Không tìm thấy thông tin môn học");
      setIsLoading(false);
      return;
    }

    const fetchSubjectDetails = async () => {
      try {
        setIsLoading(true);
        const resp = await publicAxios.get(`public/subjects/${subjectId}`);

        if (resp.data.status === "success") {
          setSubjectData(resp.data.data);
        } else {
          setError("Không tìm thấy dữ liệu môn học.");
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  // --- 2. Xử lý Click ---
  const handleChapterClick = (chapter) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    navigate("/chapter", {
      state: {
        chapterId: chapter.chapterId,
        subjectId: subjectId,
      },
    });
  };

  const handleExamClick = (exam) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    // Chuyển hướng đến trang làm bài thi
    navigate("/exams", {
      state: {
        examId: exam.examId,
        subjectId: subjectId,
        title: exam.title, // Truyền thêm title để hiển thị nếu cần
      },
    });
  };

  // Helper tính thời gian (Dựa trên tổng số câu hỏi / 30 câu mỗi giờ)
  const estimatedHours = subjectData?.totalQuestions
    ? (subjectData.totalQuestions / 30).toFixed(1)
    : 0;

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !subjectData) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error || "Dữ liệu trống"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200 transition-colors duration-300">
      {showLoginPrompt && (
        <LoginPrompt
          onLoginRedirect={() => navigate("/login")}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CỘT TRÁI (NỘI DUNG CHÍNH) --- */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* 1. Breadcrumbs */}
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className="text-[#617589] dark:text-gray-400 text-sm font-medium cursor-pointer hover:text-blue-600"
                onClick={() => navigate("/")}
              >
                Trang chủ
              </span>
              <span className="text-[#617589] dark:text-gray-400 text-sm font-medium">
                /
              </span>
              <span
                className="text-[#617589] dark:text-gray-400 text-sm font-medium cursor-pointer hover:text-blue-600"
                onClick={() => navigate("/revision")}
              >
                Ôn tập
              </span>
              <span className="text-[#617589] dark:text-gray-400 text-sm font-medium">
                /
              </span>
              <span className="text-[#111418] dark:text-gray-200 text-sm font-medium">
                {subjectData.name}
              </span>
            </div>

            {/* 2. Header Môn học */}
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  {subjectData.name}
                </h1>
                {/* 3. Mô tả (Box) */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  {/* Khung nội dung mô tả */}
                  {subjectData.description &&
                  subjectData.description.trim() !== "" ? (
                    <p className="text-[#617589] dark:text-gray-300 text-base font-normal leading-relaxed text-justify whitespace-pre-line">
                      {subjectData.description}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-gray-400 dark:text-gray-500 gap-2">
                      <span className="material-symbols-outlined text-3xl opacity-50">
                        description
                      </span>
                      <p className="text-sm italic">
                        Hiện chưa có mô tả chi tiết cho môn học này.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleFavorite(subjectId, subjectData.name)}
                disabled={!localStorage.getItem("userId")}
                className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold gap-2 transition-colors ${
                  isFavorited
                    ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                }`}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{
                    fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}`,
                  }}
                >
                  favorite
                </span>
                <span className="truncate">
                  {isFavorited ? "Đã yêu thích" : "Thêm yêu thích"}
                </span>
              </button>
            </div>

            {/* 3. Stats Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Tổng số chương"
                value={subjectData.totalChapters || 0}
              />
              <StatsCard
                title="Câu hỏi ôn tập"
                value={subjectData.totalQuestions || 0}
              />
              <StatsCard
                title="Bài kiểm tra"
                value={subjectData.totalExams || 0}
              />
              <StatsCard title="Thời lượng" value={`~${estimatedHours}h`} />
            </div>

            {/* 4. Danh sách Chương */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-[#111418] dark:text-white">
                Nội dung môn học
              </h2>
              <div className="flex flex-col gap-3">
                {subjectData.chapters && subjectData.chapters.length > 0 ? (
                  subjectData.chapters.map((chapter, index) => (
                    <div
                      key={chapter.chapterId}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="flex-shrink-0 size-12 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-[#111418] dark:text-white truncate pr-2">
                          {chapter.name}
                        </h4>
                        <p className="text-sm text-[#617589] dark:text-gray-400 mt-1">
                          {chapter.countQuestion} câu hỏi
                        </p>
                      </div>
                      <button
                        // 1. Chỉ cho click nếu có câu hỏi
                        onClick={() =>
                          chapter.countQuestion > 0 &&
                          handleChapterClick(chapter)
                        }
                        // 2. Disable nút nếu không có câu hỏi
                        disabled={
                          !chapter.countQuestion || chapter.countQuestion === 0
                        }
                        className={`flex-shrink-0 min-w-[110px] items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-all
                          ${
                            chapter.countQuestion > 0
                              ? "cursor-pointer bg-gray-100 dark:bg-gray-700 text-[#111418] dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600"
                              : "cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-gray-700"
                          }
                        `}
                      >
                        {/* 3. Đổi text nút */}
                        {chapter.countQuestion > 0 ? "Bắt đầu" : "Chưa có"}
                      </button>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Chưa có chương bài học nào." />
                )}
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI (SIDEBAR EXAMS) --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#111418] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  assignment
                </span>
                Bài kiểm tra
              </h3>

              <div className="flex flex-col gap-3">
                {subjectData.exams && subjectData.exams.length > 0 ? (
                  subjectData.exams.slice(0, 2).map((exam) => (
                    <div
                      key={exam.examId}
                      className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#111418] dark:text-white text-sm line-clamp-2">
                          {exam.title}
                        </h4>
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                          Mới
                        </span>
                      </div>

                      <p className="text-xs text-[#617589] dark:text-gray-400 line-clamp-2">
                        {exam.description ||
                          "Bài kiểm tra tổng hợp kiến thức môn học."}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#617589] dark:text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            help
                          </span>
                          {exam.totalQuestions} câu
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            timer
                          </span>
                          {exam.duration} phút
                        </span>
                      </div>

                      <button
                        onClick={() => handleExamClick(exam)}
                        className="w-full mt-2 cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Làm bài ngay
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm italic border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    Chưa có bài kiểm tra nào
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
const StatsCard = ({ title, value }) => (
  <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">
      {title}
    </p>
    <p className="text-[#111418] dark:text-white text-2xl font-bold">{value}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
      Chưa có nội dung
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4 text-sm">
      {text}
    </p>
  </div>
);
