import React from 'react';

const LoginPrompt = ({ onLoginRedirect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div className="aura-surface-panel w-full max-w-sm transform overflow-hidden rounded-2xl p-6 text-left shadow-2xl transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-3xl text-primary">
              lock
            </span>
          </div>

          <h3 className="text-xl font-bold leading-6 text-gray-900 dark:text-white">
            Yêu cầu đăng nhập
          </h3>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Bạn cần đăng nhập tài khoản để sử dụng chức năng này.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="aura-button aura-button-subtle w-full px-4 py-2.5 text-sm"
            type="button"
          >
            Đóng
          </button>

          <button
            onClick={onLoginRedirect}
            className="aura-button aura-button-primary w-full px-4 py-2.5 text-sm"
            type="button"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
