import React from 'react';

export default function FavoritesSidebar({ favoriteList }) {
  // Dữ liệu mẫu nếu không truyền props
  const list = favoriteList || [
    { id: 1, name: "Hệ điều hành", chapters: 5 },
    { id: 2, name: "Mạng máy tính", chapters: 6 },
  ];

  return (
        <section className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-900 dark:text-white text-base font-bold leading-normal">Môn học yêu thích</h2>

          <div className="flex flex-col gap-3">
            {list.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-gray-900 dark:text-white text-sm font-semibold leading-normal truncate max-w-[150px]">
                      {item.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-normal leading-normal">
                      {item.chapters} chương
                    </p>
                  </div>
                  <button className="flex items-center justify-center size-8 rounded-full text-red-500 hover:bg-red-500/10 flex-shrink-0 transition-colors">
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {list.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có môn học yêu thích</p>
            )}
          </div>
        </section>
  );
}