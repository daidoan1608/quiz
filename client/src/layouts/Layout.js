// Layout.js
import React from "react";
import Headers from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    // THAY ĐỔI ĐÃ ÁP DỤNG Ở ĐÂY:
    <div className="layout min-h-screen bg-white dark:bg-gray-800 transition-colors duration-300">
      <Headers />
      <div className="main-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
