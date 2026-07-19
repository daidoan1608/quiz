import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider"; // Import custom hook

const GuestOnlyRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (isLoggedIn && isAdmin) {
    return <Navigate to="/" replace />; // Chuyển hướng về trang chính nếu đã đăng nhập
  }
  return children; // Hiển thị nội dung nếu chưa đăng nhập
};

export default GuestOnlyRoute;
