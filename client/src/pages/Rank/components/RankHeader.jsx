import React from 'react';

export const RankHeader = ({
  currentUserRankEntry,
  shouldPinCurrentUser,
  texts,
  userRank,
}) => (
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

    {currentUserRankEntry && (
      <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-sm h-fit dark:bg-primary/15">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-[22px]">
            person_pin_circle
          </span>
        </div>
        <div>
          <span className="block text-xs font-bold uppercase tracking-wide text-primary">
            {texts.yourRank || 'Thứ hạng của bạn'}
          </span>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              #{userRank}
            </span>
            {shouldPinCurrentUser && (
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Hiển thị thêm ở dòng 11
              </span>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
