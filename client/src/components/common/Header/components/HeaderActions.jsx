import React from 'react';
import GuestHeaderActions from './GuestHeaderActions';
import MobileMenuButton from './MobileMenuButton';
import NotificationButton from './NotificationButton';
import UserAvatarButton from './UserAvatarButton';
import UserMenu from './UserMenu';

export default function HeaderActions({
  colorTheme,
  currentAvatarUrl,
  fullName,
  handleLogout,
  isDarkMode,
  isLoggedIn,
  language,
  navigate,
  setColorTheme,
  setIsFavoritesOpen,
  setMode,
  setShowMobileMenu,
  setShowUserMenu,
  showMobileMenu,
  showUserMenu,
  t,
  toggleLanguage,
  toggleTheme,
  unreadCount,
}) {
  return (
    <div className="flex items-center gap-3">
      {isLoggedIn && (
        <NotificationButton navigate={navigate} unreadCount={unreadCount} />
      )}

      {!isLoggedIn ? (
        <GuestHeaderActions
          isDarkMode={isDarkMode}
          language={language}
          t={t}
          toggleLanguage={toggleLanguage}
          toggleTheme={toggleTheme}
        />
      ) : (
        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <UserAvatarButton
            currentAvatarUrl={currentAvatarUrl}
            fullName={fullName}
            setShowUserMenu={setShowUserMenu}
            showUserMenu={showUserMenu}
          />

          {showUserMenu && (
            <UserMenu
              colorTheme={colorTheme}
              handleLogout={handleLogout}
              isDarkMode={isDarkMode}
              language={language}
              navigate={navigate}
              setColorTheme={setColorTheme}
              setIsFavoritesOpen={setIsFavoritesOpen}
              setMode={setMode}
              setShowUserMenu={setShowUserMenu}
              t={t}
              toggleLanguage={toggleLanguage}
            />
          )}
        </div>
      )}

      <MobileMenuButton
        setShowMobileMenu={setShowMobileMenu}
        showMobileMenu={showMobileMenu}
      />
    </div>
  );
}
