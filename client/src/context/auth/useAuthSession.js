import { useCallback, useEffect, useState } from 'react';
import { appMessage } from 'utils/appMessage';
import { authApi } from 'api/services/authApi';
import { cacheUser, clearAuthStorage } from 'api/http/authStorage';
import { setStorageItem, storageKeys } from 'utils/storage';
import { AUTH_EMPTY_STATE, isClientUser, mapUserToAuthState } from './authState';
import {
  clearExplicitLogoutMark,
  createAuthStateFromUser,
  hydrateAuthSession,
  markExplicitLogout,
} from './authSession';

export const useAuthSession = () => {
  const [authState, setAuthState] = useState(AUTH_EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  const clearSessionState = useCallback(() => {
    clearAuthStorage();
    setAuthState(AUTH_EMPTY_STATE);
  }, []);

  const applyUserSession = useCallback((userData) => {
    cacheUser(userData);
    setAuthState(mapUserToAuthState(userData));
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateCurrentUserState = async () => {
      try {
        const currentUser = await hydrateAuthSession(authApi);
        if (mounted) {
          setAuthState(createAuthStateFromUser(currentUser));
        }
      } catch (error) {
        if (mounted) {
          clearSessionState();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    hydrateCurrentUserState();

    return () => {
      mounted = false;
    };
  }, [clearSessionState]);

  const login = useCallback(
    (userId, fullNameValue, avatarUrlValue) => {
      const userData =
        typeof userId === 'object'
          ? userId
          : { userId, fullName: fullNameValue, avatarUrl: avatarUrlValue };

      if (!isClientUser(userData)) {
        clearSessionState();
        appMessage.error(
          'Tài khoản quản trị không có quyền truy cập trang người dùng!'
        );
        return false;
      }

      applyUserSession(userData);
      appMessage.success('Đăng nhập thành công!');
      return true;
    },
    [applyUserSession, clearSessionState]
  );

  const updateAvatar = useCallback((newAvatarUrl) => {
    setStorageItem(storageKeys.avatarUrl, newAvatarUrl || '');
    setAuthState((prev) => ({
      ...prev,
      avatarUrl: newAvatarUrl || '',
    }));
  }, []);

  const logout = useCallback(async () => {
    markExplicitLogout();
    try {
      await authApi.logout();
    } catch (error) {
      // Clear client state even if the server session is already expired.
    }

    clearSessionState();
    appMessage.success('Đăng xuất thành công!');
    window.setTimeout(() => {
      clearExplicitLogoutMark();
    }, 1500);
  }, [clearSessionState]);

  return {
    ...authState,
    loading,
    login,
    logout,
    updateAvatar,
  };
};

