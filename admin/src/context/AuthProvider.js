import { message } from "antd";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthStorage, publicAxios } from "../api/axiosConfig";
import {
  canGlobal as policyCanGlobal,
  canMenu as policyCanMenu,
  canOnSubject as policyCanOnSubject,
  canAnySubject as policyCanAnySubject,
  canAny as policyCanAny,
  getAllowedSubjectIds as policyGetAllowedSubjectIds,
  normalizeCapabilities,
} from "../utils/adminAccessPolicy";
import { getFirstAllowedAdminPath } from "../utils/adminNavigationPolicy";

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

const hasCachedSession = () => Boolean(localStorage.getItem("userId"));

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [capabilities, setCapabilities] = useState(normalizeCapabilities());
  const [loading, setLoading] = useState(true);

  const applyCapabilities = (currentUser) => {
    const nextCapabilities = normalizeCapabilities(currentUser?.capabilities);
    setCapabilities(nextCapabilities);
  };

  useEffect(() => {
    let mounted = true;

    const hydrateCurrentUser = async () => {
      try {
        let response;
        try {
          response = await publicAxios.get("/auth/me");
        } catch (error) {
          if (error?.response?.status === 401 && !hasCachedSession()) {
            return;
          }
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
        applyCapabilities(currentUser);
        setIsLoggedIn(true);
        setUser(currentUser);
      } catch (error) {
        clearAuthStorage();
        if (!mounted) return;
        setIsLoggedIn(false);
        setUser(null);
        setCapabilities(normalizeCapabilities());
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

    if (!isAdminUser(userData)) {
      clearAuthStorage();
      setIsLoggedIn(false);
      setUser(null);
      message.error("Tài khoản người dùng không có quyền truy cập trang quản trị!");
      return false;
    }

    cacheAdminUser(userData);
    setIsLoggedIn(true);
    setUser(userData);
    applyCapabilities(userData);
    const nextCapabilities = normalizeCapabilities(userData?.capabilities);
    const nextCanMenu = (menu) => policyCanMenu(userData, nextCapabilities, menu);
    const firstAllowedPath = getFirstAllowedAdminPath(userData, nextCanMenu);
    if (!firstAllowedPath) {
      clearAuthStorage();
      setIsLoggedIn(false);
      setUser(null);
      setCapabilities(normalizeCapabilities());
      message.error("Tài khoản MOD chưa được gán quyền truy cập trang quản trị.");
      return false;
    }
    navigate(firstAllowedPath, { replace: true });
    return true;
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
      setCapabilities(normalizeCapabilities());
      message.success("Đăng xuất thành công!");
      navigate("/login", { replace: true });
    }
  };

  const clearSession = () => {
    clearAuthStorage();
    setIsLoggedIn(false);
    setUser(null);
    setCapabilities(normalizeCapabilities());
  };

  const canMenu = useCallback((menu) => {
    return policyCanMenu(user, capabilities, menu);
  }, [capabilities, user]);

  const canGlobal = useCallback((resource, action) => {
    return policyCanGlobal(user, capabilities, resource, action);
  }, [capabilities, user]);

  const canOnSubject = useCallback((subjectId, resource, action) => {
    return policyCanOnSubject(user, capabilities, subjectId, resource, action);
  }, [capabilities, user]);

  const canAnySubject = useCallback((resource, action) => {
    return policyCanAnySubject(user, capabilities, resource, action);
  }, [capabilities, user]);

  const canAny = useCallback((resource, action) => {
    return policyCanAny(user, capabilities, resource, action);
  }, [capabilities, user]);

  const getAllowedSubjectIds = useCallback((resource, action) => {
    return policyGetAllowedSubjectIds(user, capabilities, resource, action);
  }, [capabilities, user]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        clearSession,
        user,
        isAdmin: isAdminUser(user),
        capabilities,
        canMenu,
        canGlobal,
        canOnSubject,
        canAnySubject,
        canAny,
        getAllowedSubjectIds,
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
