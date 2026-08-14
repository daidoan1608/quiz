import React from 'react';

const DEFAULT_AVATAR = '/images/default_avatar.svg';

const renderRankIcon = (rank) => {
  if (rank === 1)
    return (
      <span className="material-symbols-outlined text-2xl text-yellow-400 drop-shadow-sm">
        emoji_events
      </span>
    );
  if (rank === 2)
    return (
      <span className="material-symbols-outlined text-2xl text-gray-400 drop-shadow-sm">
        emoji_events
      </span>
    );
  if (rank === 3)
    return (
      <span className="material-symbols-outlined text-2xl text-orange-400 drop-shadow-sm">
        emoji_events
      </span>
    );
  return null;
};

const getRankNumberStyle = (rank) => {
  if (rank <= 3) return 'text-xl font-black text-gray-800 dark:text-gray-100';
  return 'text-base font-medium text-gray-600 dark:text-gray-400';
};

export const LeaderboardRow = ({ currentUserId, item, texts }) => {
  const isCurrentUser = item.userId?.toString() === currentUserId?.toString();

  return (
    <React.Fragment>
      {item.isPinnedCurrentUser && (
        <div className="px-6 py-3">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span>Bạn nằm ngoài top 10</span>
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      )}
      <div
        className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-all duration-200
          ${
            isCurrentUser
              ? 'relative z-10 m-2 rounded-2xl border border-primary/30 bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/40 dark:bg-primary/20 dark:ring-primary/30'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
          }
        `}
      >
        <div className="col-span-2 flex items-center gap-3">
          <div className="min-w-10 text-center">
            <p className={getRankNumberStyle(item.displayPosition)}>
              {item.displayPosition}
            </p>
            {item.isPinnedCurrentUser && (
              <span className="mt-1 block text-[10px] font-black uppercase text-primary">
                Hạng #{item.rank}
              </span>
            )}
          </div>
          {!item.isPinnedCurrentUser && renderRankIcon(item.rank)}
        </div>

        <div className="col-span-6 flex items-center gap-4">
          <div
            className={`size-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700
              ${
                isCurrentUser
                  ? 'ring-4 ring-primary/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                  : ''
              }
            `}
          >
            <img
              src={item.avatarUrl || DEFAULT_AVATAR}
              alt={item.username || 'User avatar'}
              className="h-full w-full object-cover"
              decoding="async"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm truncate ${
                  isCurrentUser
                    ? 'font-black text-gray-950 dark:text-white'
                    : 'font-medium text-gray-900 dark:text-white'
                }`}
              >
                {item.username}
              </p>
              {isCurrentUser && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                  Bạn
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
              {item.subject} • {item.attemptCount}{' '}
              {texts.examAttemptUnit || 'bài thi'}
            </p>
          </div>
        </div>

        <div className="col-span-4 text-right">
          <p
            className={`text-base ${
              isCurrentUser
                ? 'font-black text-primary dark:text-blue-400'
                : 'font-bold text-gray-700 dark:text-gray-300'
            }`}
          >
            {Number(item.score).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </React.Fragment>
  );
};
