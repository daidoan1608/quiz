import { removeStorageItem, setStorageItem, storageKeys } from 'utils/storage';

export const clearAuthStorage = () => {
  removeStorageItem(storageKeys.userId);
  removeStorageItem(storageKeys.role);
  removeStorageItem(storageKeys.fullName);
  removeStorageItem(storageKeys.avatarUrl);
};

export const cacheUser = (userData) => {
  if (!userData) return;
  setStorageItem(storageKeys.userId, userData.userId || "");
  setStorageItem(storageKeys.role, userData.role || "");
  setStorageItem(storageKeys.fullName, userData.fullName || "");
  setStorageItem(storageKeys.avatarUrl, userData.avatarUrl || "");
};
