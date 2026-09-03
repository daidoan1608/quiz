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
      <header className="aura-header sticky top-0 z-50 w-full transition-all duration-300">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 md:h-24">
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
