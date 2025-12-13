import React from "react";
import { useLanguage } from "../Context/LanguageProvider";
import { useFavorites } from "../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const FavoritesModal = ({ isOpen, onClose }) => {
  const { texts } = useLanguage();
  const { favorites, toggleFavorite, loading, error } = useFavorites();
  const navigate = useNavigate();

  // Logic xử lý chuyển sang đây
  const handleDelete = (subjectId, subjectName) => {
    toggleFavorite(subjectId, subjectName);
    message.success("Đã xóa khỏi danh sách yêu thích!");
  };

  const handleReview = (subjectId) => {
    onClose(); // Đóng modal trước khi chuyển trang
    navigate(`/listChap`, { state: { subjectId } });
  };

  const handleMockTest = (subjectId) => {
    onClose();
    navigate(`/exams`, { state: { subjectId } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1C2A36] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-red-500">❤️</span>{" "}
            {texts.favoriteSubjectsTitle || "Môn học yêu thích"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}

          {!loading && !error && (
            favorites.length > 0 ? (
              <div className="grid gap-4">
                {favorites.map((fav) => (
                  <div
                    key={fav.subjectId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-700 transition"
                  >
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                        {fav.subjectName}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {fav.subjectId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReview(fav.subjectId)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow"
                      >
                        Ôn tập
                      </button>
                      <button
                        onClick={() => handleMockTest(fav.subjectId)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                      >
                        Thi thử
                      </button>
                      <button
                        onClick={() => handleDelete(fav.subjectId, fav.subjectName)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                {texts.noFavorites || "Chưa có môn học yêu thích."}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;