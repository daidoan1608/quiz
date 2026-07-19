export const EXPLICIT_LOGOUT_KEY = 'explicitLogoutInProgress';

export const isExplicitLogoutInProgress = () =>
  typeof sessionStorage !== 'undefined' &&
  sessionStorage.getItem(EXPLICIT_LOGOUT_KEY) === 'true';

export const markExplicitLogout = () => {
  sessionStorage.setItem(EXPLICIT_LOGOUT_KEY, 'true');
};

export const clearExplicitLogoutMark = () => {
  sessionStorage.removeItem(EXPLICIT_LOGOUT_KEY);
};
