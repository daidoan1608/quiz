import { message } from "antd";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthStorage, publicAxios } from "../api/axiosConfig";

const AuthContext = createContext();

const cacheAdminUser = (userData) => {
  if (!userData) return;
  localStorage.setItem("userId", userData.userId || "");
  localStorage.setItem("role", userData.role || "");
  localStorage.setItem("username", userData.username || "");
  localStorage.setItem("fullName", userData.fullName || userData.username || "Admin");
  localStorage.setItem("avatarUrl", userData.avatarUrl || "");
};

const isAdminUser = (userData) => ["ADMIN", "MOD"].includes(userData?.role);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrateCurrentUser = async () => {
      try {
        let response;
        try {
          response = await publicAxios.get("/auth/me");
        } catch (error) {
          await publicAxios.post("/auth/refresh");
          response = await publicAxios.get("/auth/me");
        }
        const currentUser = response?.data?.data;
        if (!mounted || !currentUser?.userId) return;
        if (!isAdminUser(currentUser)) {
          await publicAxios.post("/auth/logout").catch(() => {});
          clearAuthStorage();
          if (!mounted) return;
          setIsLoggedIn(false);
          setUser(null);
          return;
        }

        cacheAdminUser(currentUser);
        setIsLoggedIn(true);
        setUser(currentUser);
      } catch (error) {
        clearAuthStorage();
        if (!mounted) return;
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    hydrateCurrentUser();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (userId, role, username, fullName) => {
    const userData =
      typeof userId === "object" ? userId : { userId, role, username, fullName };

    cacheAdminUser(userData);
    setIsLoggedIn(true);
    setUser(userData);
    navigate("/", { replace: true });
  };

  const logout = async () => {
    try {
      const { publicAxios } = await import("../api/axiosConfig");
      await publicAxios.post("/auth/logout");
    } catch (error) {
      // Clear client state even if the server session is already expired.
    } finally {
      clearAuthStorage();
      setIsLoggedIn(false);
      setUser(null);
      message.success("Dang xuat thanh cong!");
      navigate("/login", { replace: true });
    }
  };

  const clearSession = () => {
    clearAuthStorage();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, clearSession, user, isAdmin: isAdminUser(user) }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
