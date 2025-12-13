import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/Login";
import ProtectedRoute from "./context/ProtectedRoute";
import GuestOnlyRoute from "./context/GuestOnlyRoute";
import Display from "./layouts/Display";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <Router>
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
