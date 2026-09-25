import React from 'react';
import { CLIENT_AVATAR_URL } from 'config/env';
import { resolveMediaUrl } from 'utils/mediaUrl';
import { getStoredAvatarUrl } from 'utils/storage';

const DEFAULT_AVATAR = '/images/default_avatar.svg';

export default function UserProfileCard({
  user,
  avatarUrl,
  uploadingAvatar = false,
  onUploadAvatar,
  onPersonalInfoClick,
  onRoadmapClick,
  onChangePasswordClick,
  texts,
}) {
  const resolvedAvatarUrl =
    avatarUrl || user?.avatarUrl || getStoredAvatarUrl();
  const avatarSrc = resolvedAvatarUrl
    ? resolveMediaUrl(resolvedAvatarUrl, CLIENT_AVATAR_URL)
    : DEFAULT_AVATAR;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && !uploadingAvatar) {
      onUploadAvatar(file);
    }
    e.target.value = '';
  };

  return (
    <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-6">
      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center">
        <div className="relative group">
          <img
            src={avatarSrc}
            alt={user?.fullName || user?.username || 'User Avatar'}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20 dark:ring-primary/40 bg-gray-100 dark:bg-gray-700 transition-all duration-300"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
          {/* Overlay Upload Icon / Loading Spinner */}
          {uploadingAvatar ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full text-white backdrop-blur-[2px] transition-all">
              <span className="material-symbols-outlined text-2xl animate-spin">
                progress_activity
              </span>
              <span className="text-[10px] font-semibold mt-1">Đang tải...</span>
            </div>
          ) : (
            <label
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              title={texts?.changeAvatar || 'Đổi ảnh đại diện'}
            >
              <span className="material-symbols-outlined text-2xl">photo_camera</span>
              <span className="text-[10px] font-semibold mt-0.5">Đổi ảnh</span>
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={uploadingAvatar}
              />
            </label>
          )}
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
          {user.fullName || user.username}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        <span className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wide">
          {user.role}
        </span>
      </div>

      {/* Menu Actions */}
      <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-gray-700 pt-4">
        <button
          onClick={onPersonalInfoClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
        >
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">
            person
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">
            {texts?.personalInfo || 'Thông tin cá nhân'}
          </span>
        </button>

        <button
          onClick={onRoadmapClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
        >
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">
            route
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">
            {texts?.learningRoadmap || 'Lộ trình'}
          </span>
        </button>

        <button
          onClick={onChangePasswordClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
        >
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">
            lock_reset
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">
            {user?.authProvider === 'GOOGLE' && !user?.hasPassword
              ? 'Thiết lập mật khẩu'
              : texts?.changePass || 'Đổi mật khẩu'}
          </span>
        </button>
      </div>
    </div>
  );
}
