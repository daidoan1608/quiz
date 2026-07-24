const isBrowser = typeof window !== "undefined";

export const storageKeys = {
  userId: "userId",
  savedUsername: "savedUsername",
  role: "role",
  fullName: "fullName",
  avatarUrl: "avatarUrl",
  authProvider: "authProvider",
  hasPassword: "hasPassword",
  appLanguage: "appLanguage",
  themeMode: "theme-mode",
  themeColor: "theme-color",
};

export const getStorageItem = (key, fallback = null) => {
  if (!isBrowser) return fallback;
  return localStorage.getItem(key) ?? fallback;
};

export const setStorageItem = (key, value) => {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
};

export const removeStorageItem = (key) => {
  if (!isBrowser) return;
  localStorage.removeItem(key);
};

export const getCurrentUserId = () => getStorageItem(storageKeys.userId);

export const getStoredAvatarUrl = () => getStorageItem(storageKeys.avatarUrl, "");

export const getStoredLanguage = () => getStorageItem(storageKeys.appLanguage, "vi");

export const setStoredLanguage = (language) =>
  setStorageItem(storageKeys.appLanguage, language);

export const createExamDraftKey = (userId, examId) =>
  userId && examId ? `exam_draft_${userId}_${examId}` : null;
