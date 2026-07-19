import React, { useState } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { PASSWORD_MIN_LENGTH } from '../utils/passwordValidation';

const PasswordInputField = ({
  autoComplete = 'current-password',
  helperText,
  label,
  name,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = `password-${name}`;

  return (
    <div>
      <label
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={isVisible ? 'text' : 'password'}
          required
          minLength={name === 'oldPassword' ? undefined : PASSWORD_MIN_LENGTH}
          autoComplete={autoComplete}
          className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 pr-11 text-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
        />
        <button
          type="button"
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-500 transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-gray-300"
        >
          {isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default PasswordInputField;
