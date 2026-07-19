import { useCallback } from 'react';
import { message } from 'antd';
import { authApi } from 'api/services/authApi';
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

export const useRequireAccountUser = ({ navigate, noUserIdText }) =>
  useCallback(async () => {
    let currentUser = null;
    try {
      currentUser = await authApi.getCurrentUser();
    } catch (error) {
      clearStoredUser();
      message.error(noUserIdText || 'Vui lòng đăng nhập lại!');
      navigate('/login');
      return null;
    }

    const userId = currentUser?.userId || getCurrentUserId();
    if (!userId) {
      message.error(noUserIdText || 'Vui lòng đăng nhập lại!');
      navigate('/login');
      return null;
    }

    persistCurrentUser(currentUser);
    return userId;
  }, [navigate, noUserIdText]);
