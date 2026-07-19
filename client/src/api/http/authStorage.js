export const clearAuthStorage = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("fullName");
  localStorage.removeItem("avatarUrl");
};

export const cacheUser = (userData) => {
  if (!userData) return;
  localStorage.setItem("userId", userData.userId || "");
  localStorage.setItem("role", userData.role || "");
  localStorage.setItem("fullName", userData.fullName || "");
  localStorage.setItem("avatarUrl", userData.avatarUrl || "");
};
