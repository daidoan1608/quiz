import React from 'react';

const LoginPrompt = ({ onLoginRedirect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
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
            className="flex w-full justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Đóng
          </button>

          <button
            onClick={onLoginRedirect}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
