import { message } from "antd";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "api/authApi";

const AuthContext = createContext();

const clearAuthStorage = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("fullName");
  localStorage.removeItem("avatarUrl");
};

const cacheUser = (userData) => {
  if (!userData) return;
  localStorage.setItem("userId", userData.userId || "");
  localStorage.setItem("fullName", userData.fullName || "");
  localStorage.setItem("avatarUrl", userData.avatarUrl || "");
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    const hydrateCurrentUser = async () => {
      try {
        let response;
        try {
          response = await authApi.getCurrentUser();
        } catch (error) {
          await authApi.refreshSession();
          response = await authApi.getCurrentUser();
        }
        const currentUser = response;
        if (!mounted || !currentUser?.userId) return;

        cacheUser(currentUser);
        setIsLoggedIn(true);
        setUser(currentUser.userId);
        setFullName(currentUser.fullName || "");
        setAvatarUrl(currentUser.avatarUrl || "");
      } catch (error) {
        clearAuthStorage();
        if (!mounted) return;
        setIsLoggedIn(false);
        setUser(null);
        setFullName("");
        setAvatarUrl("");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    hydrateCurrentUser();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (userId, fullNameValue, avatarUrlValue) => {
    const userData =
      typeof userId === "object"
        ? userId
        : { userId, fullName: fullNameValue, avatarUrl: avatarUrlValue };

    cacheUser(userData);
    setIsLoggedIn(true);
    setUser(userData.userId);
    setFullName(userData.fullName || "");
    setAvatarUrl(userData.avatarUrl || "");

    message.success("Dang nhap thanh cong!");
  };

  const updateAvatar = (newAvatarUrl) => {
    localStorage.setItem("avatarUrl", newAvatarUrl || "");
    setAvatarUrl(newAvatarUrl || "");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Clear client state even if the server session is already expired.
    }

    clearAuthStorage();
    setIsLoggedIn(false);
    setUser(null);
    setFullName("");
    setAvatarUrl("");
    message.success("Dang xuat thanh cong!");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, user, loading, fullName, avatarUrl, updateAvatar }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
