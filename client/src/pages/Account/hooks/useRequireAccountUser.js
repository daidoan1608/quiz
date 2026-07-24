import { useCallback } from 'react';
import { appMessage } from 'utils/appMessage';
import { authApi } from 'api/services/authApi';
import { hydrateAuthSession } from 'context/auth/authSession';
import {
  getCurrentUserId,
  removeStorageItem,
  setStorageItem,
  storageKeys,
} from 'utils/storage';

const clearStoredUser = () => {
  removeStorageItem(storageKeys.userId);
  removeStorageItem(storageKeys.fullName);
  removeStorageItem(storageKeys.avatarUrl);
};

const persistCurrentUser = (currentUser) => {
  if (!currentUser?.userId) return;

  setStorageItem(storageKeys.userId, currentUser.userId);
  setStorageItem(storageKeys.fullName, currentUser.fullName || '');
  setStorageItem(storageKeys.avatarUrl, currentUser.avatarUrl || '');
};

const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!';

export const useRequireAccountUser = ({ navigate }) =>
  useCallback(async () => {
    let currentUser = null;
    try {
      currentUser = await hydrateAuthSession(authApi);
    } catch (error) {
      clearStoredUser();
      appMessage.error(SESSION_EXPIRED_MESSAGE);
      navigate('/login', { replace: true });
      return null;
    }

    const userId = currentUser?.userId || getCurrentUserId();
    if (!userId) {
      appMessage.error(SESSION_EXPIRED_MESSAGE);
      navigate('/login', { replace: true });
      return null;
    }

    persistCurrentUser(currentUser);
    return userId;
  }, [navigate]);

