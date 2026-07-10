import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageProvider";

export default function LessonList() {
  const [favoriteSubjects, setFavoriteSubjects] = useState([]);
  const navigate = useNavigate();
  const { texts } = useLanguage();

  // Load favorite subjects from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavoriteSubjects(savedFavorites);
  }, []);

  const handleRemoveFavorite = (subjectId) => {
    const updatedFavorites = favoriteSubjects.filter(
      (item) => item.subjectId !== subjectId
    );
    setFavoriteSubjects(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Hàm chuyển hướng khi bấm vào môn học
  const handleViewSubject = (item) => {
    navigate(`/subjects/${item.subjectId}`, { state: { subjectId: item.subjectId } });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8 font-display transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {texts.listSubject || "Môn học yêu thích"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">
            Danh sách các môn học bạn đang theo dõi.
          </p>
        </div>

        {/* --- Grid Container --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteSubjects.length === 0 ? (
            // --- Empty State ---
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                bookmark_remove
              </span>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                {texts.noFavorites || "Bạn chưa có môn học yêu thích nào."}
              </p>
              <button
                onClick={() => navigate("/subjects")}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Khám phá môn học
              </button>
            </div>
          ) : (
            // --- Card List ---
            favoriteSubjects.map((item) => (
              <div
                key={item.subjectId}
                className="group relative flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Content */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    {/* Icon đại diện */}
                    <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <span className="material-symbols-outlined text-xl">
                        menu_book
                      </span>
                    </div>
                  </div>

                  <h3
                    className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-primary transition-colors min-h-[3.5rem]"
                    onClick={() => handleViewSubject(item)}
                  >
                    {item.subjectName}
                  </h3>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex gap-3">
                  {/* Nút Xem */}
                  <button
                    onClick={() => handleViewSubject(item)}
                    className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Vào học
                  </button>

                  {/* Nút Xóa */}
                  <button
                    onClick={() => handleRemoveFavorite(item.subjectId)}
                    className="h-10 px-3 flex items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    title={texts.delete || "Xóa"}
                  >
                    <span className="material-symbols-outlined text-xl">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
