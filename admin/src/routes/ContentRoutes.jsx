import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { adminDetailRoutes, adminLayoutRoutes } from "./adminLayoutRoutes";
import { ADMIN_ROUTES, getFirstAllowedAdminPath } from "../utils/adminNavigationPolicy";

const routeMenus = Object.fromEntries(ADMIN_ROUTES.map((route) => [route.path, route.menu]));

export default function ContentRoutes() {
  const { user, canMenu } = useAuth();
  const isMod = user?.role === "MOD";
  const fallbackPath = getFirstAllowedAdminPath(user, canMenu);
  const denyTarget = fallbackPath ? <Navigate to={fallbackPath} replace /> : <Navigate to="/login" replace />;
  const guarded = (path, element) => {
    if (!isMod) return element;
    return canMenu(routeMenus[path]) ? element : denyTarget;
  };

  return (
    <Routes>
      {adminLayoutRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={guarded(route.path, route.element)} />
      ))}
      {adminDetailRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={guarded(route.parentPath, route.element)} />
      ))}
      <Route path="*" element={fallbackPath ? <Navigate to={fallbackPath} replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
