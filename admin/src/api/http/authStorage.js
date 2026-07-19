export const clearAuthStorage = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("fullName");
};
