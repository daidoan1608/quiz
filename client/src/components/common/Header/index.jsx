import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FavoritesModal from './components/FavoritesModal';
import { useAuth } from 'context/auth/AuthProvider';
import { useLanguage } from 'context/language/LanguageProvider';
import { useNotifications } from 'context/notifications/NotificationProvider';
import { useTheme } from 'context/theme/ThemeProvider';
import { getStoredAvatarUrl } from 'utils/storage';
import DesktopNav from './components/DesktopNav';
import HeaderActions from './components/HeaderActions';
import Logo from './components/Logo';
import MobileMenu from './components/MobileMenu';
import { useHeaderActions } from './hooks/useHeaderActions';
import { useHeaderNavigation } from './hooks/useHeaderNavigation';

export default function Header() {
  const { isLoggedIn, logout, fullName, avatarUrl } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();
  const { mode, setMode, colorTheme, setColorTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkMode = mode === 'dark';
  const currentAvatarUrl = avatarUrl || getStoredAvatarUrl();
  const navigation = useHeaderNavigation({ language, location, navigate, t });
  const actions = useHeaderActions({
    isDarkMode,
    location,
    logout,
    navigate,
    setMode,
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-gradient-to-r from-white/92 via-blue-50/88 to-indigo-50/86 shadow-lg shadow-blue-900/5 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:from-slate-950/92 dark:via-blue-950/70 dark:to-indigo-950/72 dark:shadow-black/30">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-24">
            <Logo onClick={() => navigate('/')} />

            <DesktopNav
              activePill={navigation.activePill}
              isActive={navigation.isActive}
              navItemRefs={navigation.navItemRefs}
              navItems={navigation.navItems}
              navRef={navigation.navRef}
              navigate={navigate}
            />

            <HeaderActions
              colorTheme={colorTheme}
              currentAvatarUrl={currentAvatarUrl}
              fullName={fullName}
              handleLogout={actions.handleLogout}
              isDarkMode={isDarkMode}
              isLoggedIn={isLoggedIn}
              language={language}
              navigate={navigate}
              setColorTheme={setColorTheme}
              setIsFavoritesOpen={actions.setIsFavoritesOpen}
              setMode={setMode}
              setShowMobileMenu={navigation.setShowMobileMenu}
              setShowUserMenu={actions.setShowUserMenu}
              showMobileMenu={navigation.showMobileMenu}
              showUserMenu={actions.showUserMenu}
              t={t}
              toggleLanguage={toggleLanguage}
              toggleTheme={actions.toggleTheme}
              unreadCount={unreadCount}
            />
          </div>

          {navigation.showMobileMenu && (
            <MobileMenu
              colorTheme={colorTheme}
              handleMobileNavClick={navigation.handleMobileNavClick}
              isActive={navigation.isActive}
              isDarkMode={isDarkMode}
              isLoggedIn={isLoggedIn}
              language={language}
              navItems={navigation.navItems}
              setColorTheme={setColorTheme}
              setMode={setMode}
              t={t}
              toggleLanguage={toggleLanguage}
            />
          )}
        </div>
      </header>

      <FavoritesModal
        isOpen={actions.isFavoritesOpen}
        onClose={() => actions.setIsFavoritesOpen(false)}
      />
    </>
  );
}
