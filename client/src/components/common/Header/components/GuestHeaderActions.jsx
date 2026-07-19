import React from 'react';
import { Link } from 'react-router-dom';
import HeaderIconButton from './HeaderIconButton';

const GuestHeaderActions = ({
  isDarkMode,
  language,
  t,
  toggleLanguage,
  toggleTheme,
}) => (
  <>
    <HeaderIconButton onClick={toggleLanguage} title={t('language.change')}>
      <span className="text-xs font-bold">
        {language === 'vi' ? 'VN' : 'EN'}
      </span>
    </HeaderIconButton>

    <HeaderIconButton onClick={toggleTheme} title={t('theme.dark')}>
      <span className="material-symbols-outlined text-xl">
        {isDarkMode ? 'light_mode' : 'dark_mode'}
      </span>
    </HeaderIconButton>

    <div className="hidden gap-2 md:flex">
      <Link
        to="/login"
        className="!no-underline rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
      >
        {t('auth.login')}
      </Link>
      <Link
        to="/register"
        className="!no-underline rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
      >
        {t('auth.register')}
      </Link>
    </div>
  </>
);

export default GuestHeaderActions;
