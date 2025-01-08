import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/Context/AuthProvider';
import Login from './components/Login';
import ProtectedRoute from './components/Context/ProtectedRoute';
import GuestOnlyRoute from './components/Context/GuestOnlyRoute'; // Component để bảo vệ trang đăng nhập
import Display from './components/Display';


function App() {
  return (
    <Router> {/* Chỉ bọc Router ở đây một lần duy nhất */}

    <AuthProvider> {/* Đặt AuthProvider ở đây để cung cấp context cho toàn bộ ứng dụng */}
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
