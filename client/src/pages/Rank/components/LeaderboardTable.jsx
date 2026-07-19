import React from 'react';
import { LeaderboardRow } from './LeaderboardRow';

export const LeaderboardTable = ({
  currentUserId,
  displayedLeaderboard,
  filterCriteria,
  isLoading,
  texts,
}) => (
  <main className="lg:col-span-8 xl:col-span-9">
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
        <div className="col-span-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-2">
          {texts.rankHeader || 'Hạng'}
        </div>
        <div className="col-span-6 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {texts.userHeader || 'Người dùng'}
        </div>
        <div className="col-span-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {filterCriteria === 'total'
            ? texts.totalScoreShort || 'Tổng điểm'
            : texts.avgScoreShort || 'Điểm TB'}
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {isLoading ? (
          <div className="py-20 text-center">
            <div
              className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
              role="status"
              aria-label="loading"
            />
          </div>
        ) : displayedLeaderboard.length > 0 ? (
          displayedLeaderboard.map((item) => (
            <LeaderboardRow
              key={`${item.userId}-${item.rank}`}
              currentUserId={currentUserId}
              item={item}
              texts={texts}
            />
          ))
        ) : (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            {texts.noResultMessage || 'Chưa có dữ liệu xếp hạng.'}
          </div>
        )}
      </div>
    </div>
  </main>
);
