import React from 'react';
import { message } from 'antd';
import PasswordInputField from './PasswordInputField';
import {
  getPasswordChangeValidationMessage,
  PASSWORD_MIN_LENGTH,
} from '../utils/passwordValidation';

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  texts = {},
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const oldPassword = data.oldPassword?.trim() || '';
    const newPassword = data.newPassword?.trim() || '';
    const confirmPassword = data.confirmPassword?.trim() || '';
    const validationMessage = getPasswordChangeValidationMessage({
      confirmPassword,
      newPassword,
      oldPassword,
      texts,
    });

    if (validationMessage) {
      message.warning(validationMessage);
      return;
    }

    onSubmit({ oldPassword, newPassword });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {texts.changePass || 'Đổi mật khẩu'}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PasswordInputField
            label={texts.oldPassword || 'Mật khẩu hiện tại'}
            name="oldPassword"
          />
          <PasswordInputField
            autoComplete="new-password"
            helperText={`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự, gồm cả chữ và số.`}
            label={texts.newPassword || 'Mật khẩu mới'}
            name="newPassword"
          />
          <PasswordInputField
            autoComplete="new-password"
            label={texts.confirmPassword || 'Xác nhận mật khẩu mới'}
            name="confirmPassword"
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              {texts.cancel || 'Hủy'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 font-bold shadow-lg shadow-blue-500/30"
            >
              {texts.saveChanges || 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
