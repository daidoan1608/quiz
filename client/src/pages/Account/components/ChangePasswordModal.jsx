import React from 'react';
import { appMessage } from 'utils/appMessage';
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
      appMessage.warning(validationMessage);
      return;
    }

    onSubmit({ oldPassword, newPassword });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="aura-surface-panel w-full max-w-md rounded-xl p-6 shadow-2xl animate-in zoom-in-95">
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
              className="aura-button aura-button-subtle flex-1 py-2 text-sm"
            >
              {texts.cancel || 'Hủy'}
            </button>
            <button
              type="submit"
              className="aura-button aura-button-primary flex-1 py-2 text-sm"
            >
              {texts.saveChanges || 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

