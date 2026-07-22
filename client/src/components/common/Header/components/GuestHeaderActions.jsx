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

    <div className="hidden shrink-0 gap-2 xl:flex">
      <Link
        to="/login"
        className="aura-button aura-button-subtle min-h-0 min-w-28 whitespace-nowrap px-4 py-2 text-sm !no-underline"
      >
        {t('auth.login')}
      </Link>
      <Link
        to="/register"
        className="aura-button aura-button-primary min-h-0 min-w-24 whitespace-nowrap px-4 py-2 text-sm !no-underline"
      >
        {t('auth.register')}
      </Link>
    </div>
  </>
);

export default GuestHeaderActions;
