// Layout.js
import React from "react";
import Headers from "../Header"; // Đảm bảo import Header của bạn
import { Outlet } from "react-router-dom"; // Outlet dùng để render các component con
import Footer from "../Footer";

const Layout = () => {
  return (
    <div>
      <Headers /> {/* Chỉ hiển thị Header ở đây */}
      <Outlet /> {/* Đây là nơi render các component con */}
      <Footer/>
    </div>
  );
};

export default Layout;
