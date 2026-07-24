import React from 'react';
import { appMessage } from 'utils/appMessage';
import PasswordInputField from './PasswordInputField';
import {
  getPasswordSetupValidationMessage,
  PASSWORD_MIN_LENGTH,
} from '../utils/passwordValidation';

const SetPasswordPanel = ({ onSubmit, texts = {} }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const newPassword = data.newPassword?.trim() || '';
    const confirmPassword = data.confirmPassword?.trim() || '';
    const validationMessage = getPasswordSetupValidationMessage({
      confirmPassword,
      newPassword,
      texts,
    });

    if (validationMessage) {
      appMessage.warning(validationMessage);
      return;
    }

    onSubmit({ newPassword });
    e.target.reset();
  };

  return (
    <section className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Thiết lập mật khẩu
      </h3>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
        <div className="md:col-span-2">
          <button type="submit" className="aura-button aura-button-primary px-4 py-2 text-sm">
            Lưu mật khẩu
          </button>
        </div>
      </form>
    </section>
  );
};

export default SetPasswordPanel;
