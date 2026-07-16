import React from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from 'context/FavoritesContext';
import { useLanguage } from 'context/LanguageProvider';

const FavoritesModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { favorites, toggleFavorite, loading, error } = useFavorites();
  const navigate = useNavigate();
  const favoriteCountText =
    favorites.length > 0
      ? `${favorites.length} môn đã lưu để truy cập nhanh`
      : 'Lưu những môn bạn học thường xuyên để quay lại nhanh hơn.';

  const handleDelete = (subjectId, subjectName) => {
    toggleFavorite(subjectId, subjectName);
    message.success('Đã xóa khỏi danh sách yêu thích.');
  };

  const handleOpenSubject = (subjectId) => {
    onClose();
    navigate(`/subjects/${subjectId}`, { state: { subjectId } });
  };

  const handleSmartPractice = (subject) => {
    onClose();
    navigate(`/subjects/${subject.subjectId}/practice`, {
      state: {
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        chapters: subject.chapters || [],
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200 dark:bg-surface-dark dark:ring-white/10">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6 dark:border-gray-700">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              <span className="material-symbols-outlined text-2xl">favorite</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-black text-gray-950 dark:text-white">
                {t('favoriteSubjectsTitle', 'Môn học yêu thích')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {favoriteCountText}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {loading && (
            <div className="flex min-h-40 items-center justify-center text-gray-500 dark:text-gray-400">
              Đang tải danh sách yêu thích...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            (favorites.length > 0 ? (
              <div className="grid gap-4">
                {favorites.map((fav, index) => (
                  <article
                    key={fav.subjectId}
                    className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => handleOpenSubject(fav.subjectId)}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <span className="material-symbols-outlined">
                            {index % 2 === 0 ? 'menu_book' : 'school'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-lg font-black text-gray-950 transition group-hover:text-primary dark:text-white">
                            {fav.subjectName}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Mở môn học, ôn tập thông minh hoặc xem các chương.
                          </p>
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <button
                          onClick={() => handleSmartPractice(fav)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
                        >
                          <span className="material-symbols-outlined text-lg">
                            psychology
                          </span>
                          Ôn thông minh
                        </button>
                        <button
                          onClick={() => handleOpenSubject(fav.subjectId)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          <span className="material-symbols-outlined text-lg">
                            arrow_forward
                          </span>
                          Chi tiết
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(fav.subjectId, fav.subjectName)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          title="Xóa khỏi yêu thích"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/60">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm dark:bg-gray-900">
                  <span className="material-symbols-outlined text-3xl">
                    bookmark_add
                  </span>
                </div>
                <p className="text-base font-bold text-gray-700 dark:text-gray-200">
                  {t('noFavorites', 'Chưa có môn học yêu thích.')}
                </p>
                <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                  Vào danh sách môn học và bấm nút yêu thích trên môn bạn muốn
                  theo dõi.
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;
