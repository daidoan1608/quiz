import React from 'react';

const HEADER_ICON_BUTTON_CLASS =
  'hidden lg:flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg size-10 bg-gray-100 dark:bg-gray-700/50 text-[#111418] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors';

const HeaderIconButton = ({ children, className = '', onClick, title }) => (
  <button
    onClick={onClick}
    className={`${HEADER_ICON_BUTTON_CLASS} ${className}`}
    title={title}
    type="button"
  >
    {children}
  </button>
);

export default HeaderIconButton;
