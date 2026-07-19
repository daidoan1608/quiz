import { useCallback } from 'react';
import { message } from 'antd';
import { authApi } from 'api/services/authApi';
import { hydrateAuthSession } from 'context/auth/authSession';
import { getCurrentUserId } from '../utils/accountUtils';

const clearStoredUser = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('fullName');
  localStorage.removeItem('avatarUrl');
};

const persistCurrentUser = (currentUser) => {
  if (!currentUser?.userId) return;

  localStorage.setItem('userId', currentUser.userId);
  localStorage.setItem('fullName', currentUser.fullName || '');
  localStorage.setItem('avatarUrl', currentUser.avatarUrl || '');
};

const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!';

export const useRequireAccountUser = ({ navigate }) =>
  useCallback(async () => {
    let currentUser = null;
    try {
      currentUser = await hydrateAuthSession(authApi);
    } catch (error) {
      clearStoredUser();
      message.error(SESSION_EXPIRED_MESSAGE);
      navigate('/login', { replace: true });
      return null;
    }

    const userId = currentUser?.userId || getCurrentUserId();
    if (!userId) {
      message.error(SESSION_EXPIRED_MESSAGE);
      navigate('/login', { replace: true });
      return null;
    }

    persistCurrentUser(currentUser);
    return userId;
  }, [navigate]);
