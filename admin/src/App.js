import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/Login";
import ProtectedRoute from "./context/ProtectedRoute";
import GuestOnlyRoute from "./context/GuestOnlyRoute";
import Display from "./layouts/Display";
import { ThemeProvider } from "./context/ThemeContext";

const ADMIN_BASENAME = "/admin";

function normalizeAdminPath() {
  const { pathname, search, hash } = window.location;

  // Khi chạy admin ở localhost:3000, nếu gõ trực tiếp /login thì BrowserRouter
  // với basename=/admin sẽ không match route nào và trang bị trắng.
  // Chuẩn hoá về /admin/login để route /login bên trong basename hoạt động.
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    window.history.replaceState(null, "", `${ADMIN_BASENAME}${pathname}${search}${hash}`);
  }
}

function App() {
  normalizeAdminPath();

  return (
    <Router basename={ADMIN_BASENAME}>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <Login />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Display />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
