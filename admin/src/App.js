import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./components/Login";
import ProtectedRoute from "./context/ProtectedRoute";
import GuestOnlyRoute from "./context/GuestOnlyRoute";
import Display from "./layouts/Display";

function App() {
  return (
    <Router>
      {" "}
      {/* Chỉ bọc Router ở đây một lần duy nhất */}
      <AuthProvider>
        {" "}
        {/* Đặt AuthProvider ở đây để cung cấp context cho toàn bộ ứng dụng */}
        <Routes>
          {/* Trang đăng nhập */}
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
      </AuthProvider>
    </Router>
  );
}

export default App;
