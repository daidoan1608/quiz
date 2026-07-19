import React from 'react';

export default function LanguageMenuItem({ language, t, toggleLanguage }) {
  return (
    <div
      onClick={toggleLanguage}
      className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
          language
        </span>
        <p className="flex-1 truncate text-base font-normal leading-normal text-gray-800 dark:text-gray-200">
          {t('language.label')}:{' '}
          <span className=" text-blue-600">
            {language === 'vi'
              ? t('language.vietnamese')
              : t('language.english')}
          </span>
        </p>
      </div>
    </div>
  );
}
