import React from "react";
import { useForm } from "react-hook-form"; // Khuyên dùng react-hook-form thay vì Antd Form để nhẹ hơn

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  texts,
}) {
  // Demo dùng HTML Form đơn giản nếu không muốn cài thêm thư viện
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (data.newPassword !== data.confirmPassword) {
      alert(texts.passwordMismatch || "Mật khẩu xác nhận không khớp!");
      return;
    }
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {texts.changePass || "Đổi mật khẩu"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {texts.oldPassword || "Mật khẩu cũ"}
            </label>
            <input
              name="oldPassword"
              type="password"
              required
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {texts.newPassword || "Mật khẩu mới"}
            </label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {texts.confirmPassword || "Xác nhận mật khẩu"}
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 font-bold shadow-lg shadow-blue-500/30"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
