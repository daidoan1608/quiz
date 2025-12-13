import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicAxios } from "../../../api/axiosConfig";
import { useAuth } from "../../Context/AuthProvider";
import { useFavorites } from "../../Context/FavoritesContext";
import LoginPrompt from "../../User/LoginPrompt";

export default function RevisionListChap() {
  const [chapters, setChapters] = useState([]);
  const [subjectInfo, setSubjectInfo] = useState({
    name: "Đang tải...",
    description: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId } = location.state || {}; // Lấy ID từ trang trước
  const { isLoggedIn } = useAuth();

  // Lấy context yêu thích để xử lý nút Tim
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.some((fav) => fav.subjectId === subjectId);

  // 1. Fetch dữ liệu Chương
  const getChapterBySubjectId = async (id) => {
    try {
      setIsLoading(true);
      setError(null);

      // Gọi API lấy chương
      const resp = await publicAxios.get(`public/chapters/subject/${id}`);

      if (resp.data.status === "success") {
        setChapters(resp.data.data);
      } else {
        setError("Không tìm thấy thông tin chương.");
      }

      // Gọi API lấy thông tin môn học (Nếu API tách riêng, nếu không thì dùng mock hoặc lấy từ list subjects)
      // Ở đây mình giả lập gọi API subject hoặc dùng tên mặc định nếu API chapters không trả về tên môn
      try {
        const subResp = await publicAxios.get(`public/subjects/${id}`);
        // Giả sử API trả về chi tiết môn. Nếu không có API này, bạn có thể truyền name qua location.state
        if (subResp.data.data) {
          setSubjectInfo(subResp.data.data);
        }
      } catch (err) {
        // Nếu lỗi lấy chi tiết môn, giữ nguyên state mặc định hoặc lấy từ location
        if (location.state?.subjectName) {
          setSubjectInfo((prev) => ({
            ...prev,
            name: location.state.subjectName,
          }));
        }
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      getChapterBySubjectId(subjectId);
    } else {
      setError("Không tìm thấy thông tin môn học");
      setIsLoading(false);
    }
  }, [subjectId]);

  // 2. Xử lý Click
  const handleChapterClick = (chapter) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    navigate("/chap", {
      state: {
        chapterId: chapter.chapterId,
        subjectId: subjectId,
      },
    });
  };

  const handleLoginRedirect = () => navigate("/login");
  const handleCloseLoginPrompt = () => setShowLoginPrompt(false);

  // Helper: Format thời gian ước tính (Giả lập logic)
  const estimatedHours = chapters.length * 2; // Giả sử mỗi chương học 2 tiếng

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
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
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt
          onLoginRedirect={handleLoginRedirect}
          onClose={handleCloseLoginPrompt}
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
                {subjectInfo.name}
              </span>
            </div>

            {/* 2. Header Môn học */}
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  {subjectInfo.name}
                </h1>
                <p className="text-[#617589] dark:text-gray-400 text-base font-normal leading-normal">
                  {subjectInfo.description ||
                    `Học phần chuyên sâu về ${subjectInfo.name}.`}
                </p>
              </div>

              {/* Nút Yêu thích */}
              <button
                onClick={() => toggleFavorite(subjectId, subjectInfo.name)}
                disabled={!localStorage.getItem("userId")}
                className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold gap-2 transition-colors
                  ${
                    isFavorited
                      ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                  }
                `}
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

            {/* 3. Mô tả (Box) */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-[#111418] dark:text-white">
                Mô tả môn học
              </h3>
              <p className="text-[#617589] dark:text-gray-400 text-base font-normal leading-relaxed">
                {subjectInfo.description
                  ? subjectInfo.description
                  : "Môn học này cung cấp kiến thức nền tảng và chuyên sâu, bao gồm các bài giảng lý thuyết và bài tập thực hành giúp sinh viên nắm vững kiến thức."}
              </p>
            </div>

            {/* 4. Thống kê (Grid 4 cột) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">
                  Tổng số chương
                </p>
                <p className="text-[#111418] dark:text-white text-2xl font-bold">
                  {chapters.length}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">
                  Câu hỏi ôn tập
                </p>
                <p className="text-[#111418] dark:text-white text-2xl font-bold">
                  --
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">
                  Bài kiểm tra
                </p>
                <p className="text-[#111418] dark:text-white text-2xl font-bold">
                  --
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">
                  Thời lượng
                </p>
                <p className="text-[#111418] dark:text-white text-2xl font-bold">
                  ~{estimatedHours}h
                </p>
              </div>
            </div>

            {/* 5. Danh sách Chương (Dynamic) */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-[#111418] dark:text-white">
                Nội dung môn học
              </h2>
              <div className="flex flex-col gap-3">
                {chapters.length > 0 ? (
                  chapters.map((chapter, index) => (
                    <div
                      key={chapter.chapterId}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                    >
                      {/* Số thứ tự */}
                      <div className="flex-shrink-0 size-12 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Thông tin chương */}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-[#111418] dark:text-white truncate pr-2">
                          {chapter.name}
                        </h4>
                        <p className="text-sm text-[#617589] dark:text-gray-400 mt-1">
                          {/* Placeholder cho số bài học/tiến độ nếu API chưa có */}
                          Chương {chapter.chapterNumber}
                        </p>

                        {/* Thanh tiến độ giả lập (Luôn để 0% nếu chưa có logic user tracking) */}
                        <div className="mt-2 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <button
                        onClick={() => handleChapterClick(chapter)}
                        className="flex-shrink-0 min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-700 text-[#111418] dark:text-white text-sm font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all"
                      >
                        Bắt đầu
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có chương nào được cập nhật.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI (SIDEBAR BÀI KIỂM TRA) --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#111418] dark:text-white">
                Bài kiểm tra liên quan
              </h3>

              <div className="flex flex-col gap-4">
                {/* Mock Data cho Bài kiểm tra (Vì API chapter không trả về Exams) */}
                <div className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-bold text-[#111418] dark:text-white">
                    Bài kiểm tra giữa kỳ
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-[#617589] dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        schedule
                      </span>
                      <span>60 phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        quiz
                      </span>
                      <span>40 câu</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate("/exams", { state: { subjectId: subjectId } })
                    }
                    className="w-full flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    Làm bài
                  </button>
                </div>

                <div className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-bold text-[#111418] dark:text-white">
                    Kiểm tra nhanh
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-[#617589] dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        schedule
                      </span>
                      <span>15 phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        quiz
                      </span>
                      <span>15 câu</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate("/exams", { state: { subjectId: subjectId } })
                    }
                    className="w-full flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    Làm bài
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
