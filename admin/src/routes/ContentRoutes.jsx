import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import PageLoading from "../components/common/PageLoading";
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
  const lazyElement = (Component) => (
    <React.Suspense fallback={<PageLoading />}>
      <Component />
    </React.Suspense>
  );

  return (
    <Routes>
      {adminLayoutRoutes.map(({ Component, path }) => (
        <Route key={path} path={path} element={guarded(path, lazyElement(Component))} />
      ))}
      {adminDetailRoutes.map(({ Component, parentPath, path }) => (
        <Route key={path} path={path} element={guarded(parentPath, lazyElement(Component))} />
      ))}
      <Route path="*" element={fallbackPath ? <Navigate to={fallbackPath} replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
