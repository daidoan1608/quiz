import { cacheUser, clearAuthStorage } from 'api/http/authStorage';
import {
  clearExplicitLogoutMark,
  markExplicitLogout,
} from 'api/http/explicitLogout';
import { AUTH_EMPTY_STATE, isClientUser, mapUserToAuthState } from './authState';

export const hydrateAuthSession = async (authApi) => {
  try {
    const currentUser = await authApi.getCurrentUser();
    return currentUser;
  } catch (error) {
    await authApi.refreshSession();
    return authApi.getCurrentUser();
  }
};

export const createAuthStateFromUser = (userData) => {
  if (!userData?.userId || !isClientUser(userData)) {
    clearAuthStorage();
    return AUTH_EMPTY_STATE;
  }

  cacheUser(userData);
  return mapUserToAuthState(userData);
};

export { clearExplicitLogoutMark, markExplicitLogout };
