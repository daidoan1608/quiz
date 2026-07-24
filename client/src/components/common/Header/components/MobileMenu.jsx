import React from 'react';
import AppearancePanel from './AppearancePanel';
import LanguageMenuItem from './LanguageMenuItem';

export default function MobileMenu({
  colorTheme,
  handleMobileNavClick,
  isActive,
  isDarkMode,
  isLoggedIn,
  language,
  navItems,
  setColorTheme,
  setMode,
  t,
  toggleLanguage,
}) {
  return (
    <div
      className={`max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain py-4 pb-8 border-t border-gray-100 dark:border-gray-700 space-y-2 animate-in slide-in-from-top-2 ${
        isLoggedIn ? 'lg:hidden' : 'xl:hidden'
      }`}
    >
      <div className="lg:hidden">
        {navItems.map((item) => (
          <div
            key={item.link}
            onClick={() => handleMobileNavClick(item.link)}
            className={`cursor-pointer block px-4 py-2 rounded-lg text-base font-medium ${
              isActive(item.link)
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-white dark:ring-1 dark:ring-blue-300/25'
                : 'text-gray-700 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {item.name}
          </div>
        ))}

        <div className="my-2 h-px bg-gray-100 dark:bg-gray-700" />
      </div>

      {!isLoggedIn && (
        <>
          <div
            onClick={() => handleMobileNavClick('/login')}
            className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer"
          >
            <span className="material-symbols-outlined">login</span>
            {t('auth.login')}
          </div>
          <div
            onClick={() => handleMobileNavClick('/register')}
            className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer"
          >
            <span className="material-symbols-outlined">person_add</span>
            {t('auth.register')}
          </div>

          <div className="my-2 h-px bg-gray-100 dark:bg-gray-700" />
        </>
      )}

      {!isLoggedIn && (
        <>
          <LanguageMenuItem
            language={language}
            t={t}
            toggleLanguage={toggleLanguage}
          />

          <AppearancePanel
            colorTheme={colorTheme}
            isDarkMode={isDarkMode}
            mobile
            setColorTheme={setColorTheme}
            setMode={setMode}
            t={t}
          />
        </>
      )}
    </div>
  );
}
