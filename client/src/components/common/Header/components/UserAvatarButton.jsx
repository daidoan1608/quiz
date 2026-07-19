import React from 'react';
import { resolveMediaUrl } from 'utils/mediaUrl';

export default function UserAvatarButton({
  currentAvatarUrl,
  fullName,
  setShowUserMenu,
  showUserMenu,
}) {
  return (
    <button
      onClick={() => setShowUserMenu(!showUserMenu)}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-700/50 shadow-sm ring-2 ring-transparent hover:ring-blue-500/50 transition-all focus:outline-none"
      type="button"
    >
      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
        {currentAvatarUrl ? (
          <img
            src={resolveMediaUrl(currentAvatarUrl)}
            alt={fullName || 'User Avatar'}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src =
                'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            }}
          />
        ) : (
          <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">
            {fullName?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </button>
  );
}
