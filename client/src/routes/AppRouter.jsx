import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from 'layouts';
import { layoutRoutes, standaloneRoutes } from './config/routeDefinitions';
import RouteGuard from './guards/RouteGuard';
import ScrollToTop from './ScrollToTop';

const withGuard = ({ element, guard }) =>
  guard ? <RouteGuard mode={guard}>{element}</RouteGuard> : element;

const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
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
  </BrowserRouter>
);

export default AppRouter;
