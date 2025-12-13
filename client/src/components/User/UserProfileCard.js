import React from "react";

export default function UserProfileCard({ user, onUploadAvatar, onChangePasswordClick, onLogout, texts }) {

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadAvatar(file);
    }
  };

  return (
    <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-6">

      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center">
        <div className="relative group cursor-pointer">
          <div
            className="h-24 w-24 rounded-full bg-cover bg-center ring-4 ring-primary/20 dark:ring-primary/40"
            style={{ backgroundImage: `url("${user.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp'}")` }}
          ></div>
          {/* Overlay Upload Icon */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
            <span className="material-symbols-outlined">upload</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{user.fullName || user.username}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        <span className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wide">
          {user.role}
        </span>
      </div>

      {/* Menu Actions */}
      <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-gray-700 pt-4">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group">
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">person</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">Thông tin cá nhân</span>
        </button>

        <button
          onClick={onChangePasswordClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
        >
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">lock_reset</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">
            {texts.changePass || "Đổi mật khẩu"}
          </span>
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group mt-2"
        >
          <span className="material-symbols-outlined text-red-400 group-hover:text-red-600">logout</span>
          <span className="text-sm font-medium text-red-600 group-hover:text-red-700">
            {texts.logout || "Đăng xuất"}
          </span>
        </button>
      </div>

    </div>
  );
}