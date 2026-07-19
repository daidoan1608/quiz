import React from 'react';
import AppearancePanel from './AppearancePanel';
import LanguageMenuItem from './LanguageMenuItem';

export default function UserMenu({
  colorTheme,
  handleLogout,
  isDarkMode,
  language,
  navigate,
  setColorTheme,
  setIsFavoritesOpen,
  setMode,
  setShowUserMenu,
  t,
  toggleLanguage,
}) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-xl bg-white dark:bg-surface-dark p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col">
        <div
          onClick={() => {
            navigate('/account');
            setShowUserMenu(false);
          }}
          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
            account_circle
          </span>
          <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
            {t('nav.account')}
          </p>
        </div>

        <div
          onClick={() => {
            setIsFavoritesOpen(true);
            setShowUserMenu(false);
          }}
          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
            star
          </span>
          <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
            {t('nav.favorites')}
          </p>
        </div>

        <LanguageMenuItem
          language={language}
          t={t}
          toggleLanguage={toggleLanguage}
        />

        <AppearancePanel
          colorTheme={colorTheme}
          isDarkMode={isDarkMode}
          setColorTheme={setColorTheme}
          setMode={setMode}
          t={t}
        />

        <div className="my-2 h-px bg-gray-200 dark:bg-white/10" />

        <div
          onClick={handleLogout}
          className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer group"
        >
          <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">
            logout
          </span>
          <p className="flex-1 truncate text-base font-normal leading-normal text-red-500">
            {t('auth.logout')}
          </p>
        </div>
      </div>
    </div>
  );
}
