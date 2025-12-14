import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScoreChart from "../Account/ScoreChart";

export default function ExamHistoryList({ groupedExams, texts }) {
  const navigate = useNavigate();

  // State lưu trạng thái mở của từng môn (Key: Tên môn, Value: true/false)
  // Mặc định là empty object, ta sẽ xử lý logic "mặc định mở" ở dưới
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const handleShowDetail = (exam) => {
    navigate("/detail", {
      state: {
        examId: exam.examId,
        userExamId: exam.userExamDto?.userExamId || exam.userExamDto?.id,
      },
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "--/--";
    return new Date(isoString).toLocaleDateString("vi-VN");
  };

  // Hàm toggle trạng thái
  const toggleSubject = (subject) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      // Nếu chưa có trong state (undefined) thì coi là đang mở -> bấm vào sẽ thành false (đóng)
      // Nếu đã có thì đảo ngược giá trị
      [subject]: prev[subject] === undefined ? false : !prev[subject],
    }));
  };

  if (Object.keys(groupedExams).length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Chưa có lịch sử làm bài.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedExams).map(([subject, exams]) => {
        // Kiểm tra trạng thái: Mặc định là TRUE (mở) nếu chưa được set trong state
        const isExpanded = expandedSubjects[subject] !== false;

        return (
          <div
            key={subject}
            className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm"
          >
            {/* --- Header (Click để đóng/mở) --- */}
            <div
              onClick={() => toggleSubject(subject)}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  folder_open
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {subject}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({exams.length} bài)
                  </span>
                </h3>
              </div>

              {/* Icon Chevron xoay khi đóng mở */}
              <span
                className={`material-symbols-outlined text-gray-500 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </div>

            {/* --- Content (Ẩn hiện dựa trên state) --- */}
            {/* Dùng transition để hiệu ứng mượt hơn nếu muốn, ở đây dùng điều kiện render đơn giản */}
            {isExpanded && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 animation-slide-down">
                {/* Chart */}
                <div className="mb-6">
                  <ScoreChart data={exams} />
                </div>

                {/* List Exams Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exams.map((exam, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all bg-gray-50 dark:bg-gray-800/50 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h4
                          className="font-semibold text-gray-800 dark:text-white line-clamp-2 text-sm"
                          title={exam.title}
                        >
                          {exam.title}
                        </h4>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap
                          ${
                            exam.score >= 5
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {exam.score.toFixed(1)} đ
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            calendar_today
                          </span>
                          {formatDate(exam.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            check_circle
                          </span>
                          {exam.userExamDto?.correctAnswers}/
                          {exam.userExamDto?.totalQuestions} câu đúng
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn click lan ra ngoài
                          handleShowDetail(exam);
                        }}
                        className="mt-auto w-full py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
                      >
                        {texts?.showDetail || "Xem chi tiết"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
