import React from 'react';

const MobileMenuButton = ({ setShowMobileMenu, showMobileMenu }) => (
  <button
    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 md:hidden"
    onClick={() => setShowMobileMenu(!showMobileMenu)}
    type="button"
  >
    <span className="material-symbols-outlined">
      {showMobileMenu ? 'close' : 'menu'}
    </span>
  </button>
);

export default MobileMenuButton;
