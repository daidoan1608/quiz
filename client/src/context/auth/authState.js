export const AUTH_EMPTY_STATE = {
  isLoggedIn: false,
  user: null,
  fullName: '',
  avatarUrl: '',
  role: '',
  authProvider: '',
  hasPassword: false,
};

export const isClientUser = (userData) => ['USER', 'MOD'].includes(userData?.role);

export const mapUserToAuthState = (userData) => ({
  isLoggedIn: true,
  user: userData.userId,
  fullName: userData.fullName || '',
  avatarUrl: userData.avatarUrl || '',
  role: userData.role || '',
  authProvider: userData.authProvider || '',
  hasPassword: Boolean(userData.hasPassword),
});
