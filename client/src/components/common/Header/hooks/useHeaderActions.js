import { useCallback, useEffect, useState } from 'react';

const isProtectedPath = (pathname) => {
  const protectedPrefixes = ['/account', '/notifications', '/subjects/'];

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  if (
    pathname.match(/^\/subjects\/[^/]+\/exams\/[^/]+/) ||
    pathname.match(/^\/subjects\/[^/]+\/chapters\/[^/]+/) ||
    pathname.match(/^\/subjects\/[^/]+\/practice/)
  ) {
    return true;
  }

  return pathname.startsWith('/account') || pathname.startsWith('/notifications');
};

export const useHeaderActions = ({ isDarkMode, location, logout, navigate, setMode }) => {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const toggleTheme = useCallback(() => {
    setMode(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setMode]);

  const handleLogout = useCallback(async () => {
    const shouldRedirectToLogin = isProtectedPath(location.pathname);
    await logout();
    setShowUserMenu(false);

    if (shouldRedirectToLogin) {
      navigate('/login');
    }
  }, [location.pathname, logout, navigate]);

  return {
    handleLogout,
    isFavoritesOpen,
    setIsFavoritesOpen,
    setShowUserMenu,
    showUserMenu,
    toggleTheme,
  };
};
