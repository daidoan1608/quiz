import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from 'layouts';
import { layoutRoutes, standaloneRoutes } from './config/routeDefinitions';
import RouteGuard from './guards/RouteGuard';
import ScrollToTop from './ScrollToTop';

const withGuard = ({ element, guard }) =>
  guard ? <RouteGuard mode={guard}>{element}</RouteGuard> : element;

const RouteLoadingFallback = () => (
  <div className="min-h-screen bg-[rgb(var(--bg-page))] px-4 py-10 text-center text-sm font-medium text-[var(--aura-muted)]">
    Đang tải...
  </div>
);

const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {standaloneRoutes.map((route) => (
          <Route
            element={withGuard(route)}
            key={route.path}
            path={route.path}
          />
        ))}

        <Route element={<Layout />}>
          {layoutRoutes.map((route) => (
            <Route
              element={withGuard(route)}
              key={route.path}
              path={route.path}
            />
          ))}
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
