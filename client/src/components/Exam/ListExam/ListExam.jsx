import React, { useEffect, useState } from "react";
import { authAxios, publicAxios } from "../../../api/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import LoginPrompt from "../../modal/LoginPrompt";
import { useAuth } from "../../../context/AuthProvider";
import { useLanguage } from "../../../context/LanguageProvider";

export default function ExamUsers() {
  // --- STATE ---
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Lưu số lần làm bài: Map<examId, attempts>
  const [userExamStats, setUserExamStats] = useState(new Map());

  // --- HOOKS ---
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, title } = location.state || {}; // Nhận thêm title môn học để hiển thị breadcrumb
  const { isLoggedIn } = useAuth();
  const { texts } = useLanguage();
  const userId = localStorage.getItem("userId");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Lấy danh sách đề thi
        const examResp = await publicAxios.get(
          `/public/exams/subject/${subjectId}`
        );

        if (examResp.data.responseCode === "404") {
          setExams([]); // Không có đề thi nhưng không phải lỗi hệ thống
        } else {
          setExams(examResp.data.data);
        }

        // 2. Nếu đã login, lấy lịch sử làm bài
        if (isLoggedIn && userId) {
          try {
            const historyResp = await authAxios.get(
              `users/${userId}/user-exams/count`
            );
            const statsMap = new Map();
            historyResp.data.data.forEach((item) => {
              statsMap.set(item.examId, item.attempts);
            });
            setUserExamStats(statsMap);
          } catch (histError) {
            console.error("Lỗi lấy lịch sử thi:", histError);
            // Không block UI chính nếu lỗi lấy lịch sử
          }
        }
      } catch (err) {
        console.error(err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchData();
    } else {
      setError("Không tìm thấy thông tin môn học.");
      setLoading(false);
    }
  }, [subjectId, isLoggedIn, userId]);

  // --- HANDLERS ---
  const handleExamClick = (examId) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    const startTime = new Date().toISOString();
    navigate(`/subjects/${subjectId}/exams/${examId}`, {
      state: { examId, subjectId, startTime },
    });
  };

  // --- RENDER HELPERS ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-gray-500 font-medium">
            Đang tải danh sách đề thi...
          </p>
        </div>
      </div>
    );
  }

  // Giao diện khi lỗi hoặc không có môn học ID
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
            error
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Đã xảy ra lỗi
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-display transition-colors duration-300">
      {showLoginPrompt && (
        <LoginPrompt
          onLoginRedirect={() => navigate("/login")}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span
              className="hover:text-blue-600 cursor-pointer transition-colors"
              onClick={() => navigate("/")}
            >
              Trang chủ
            </span>
            <span>/</span>
            <span
              className="hover:text-blue-600 cursor-pointer transition-colors"
              onClick={() => navigate("/subjects")}
            >
              Môn học
            </span>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {title || "Danh sách đề thi"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {texts.chooseExam || "Lựa chọn đề thi"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Chọn một đề thi bên dưới để bắt đầu làm bài.
              </p>
            </div>

            {/* Stats Summary (Optional) */}
            {isLoggedIn && (
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col px-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Đã làm
                  </span>
                  <span className="text-lg font-black text-blue-600">
                    {userExamStats.size} đề
                  </span>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col px-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Tổng số
                  </span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {exams.length} đề
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Grid Danh sách Đề thi */}
        {exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const attempts = userExamStats.get(exam.examId) || 0;
              const isAttempted = attempts > 0;

              return (
                <div
                  key={exam.examId}
                  onClick={() => handleExamClick(exam.examId)}
                  className={`group relative flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer overflow-hidden
                    ${
                      isAttempted
                        ? "border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md hover:border-blue-300"
                        : "border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1"
                    }
                  `}
                >
                  {/* Decorative Background Icon */}
                  <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-9xl text-gray-50 dark:text-gray-700/50 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    history_edu
                  </span>

                  {/* Badge Trạng thái */}
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border
                      ${
                        isAttempted
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                          : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      }
                    `}
                    >
                      {isAttempted ? (
                        <>
                          <span className="material-symbols-outlined text-[14px]">
                            check_circle
                          </span>
                          Đã làm: {attempts} lần
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[14px]">
                            radio_button_unchecked
                          </span>
                          Chưa làm
                        </>
                      )}
                    </span>
                  </div>

                  {/* Nội dung chính */}
                  <div className="relative z-10 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {exam.description ||
                        "Bài thi trắc nghiệm tổng hợp kiến thức môn học, giúp đánh giá năng lực."}
                    </p>
                  </div>

                  {/* Footer Stats & Button */}
                  <div className="relative z-10 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          quiz
                        </span>
                        40 câu
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>
                        60 phút
                      </span>
                    </div>

                    <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all">
                      <span>{isAttempted ? "Làm lại" : "Bắt đầu"}</span>
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5Z3J5ZyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/WXB88TeARFVvi/giphy.gif"
              alt="Empty State"
              className="w-32 h-32 object-contain mb-4 opacity-80"
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Chưa có đề thi nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Hiện tại môn học này chưa được cập nhật các bài kiểm tra. Vui lòng
              quay lại sau bạn nhé!
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Quay lại môn học
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
