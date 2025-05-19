// Layout.js
import React from "react";
import Headers from "../Header"; 
import { Outlet } from "react-router-dom"; 
import Footer from "../Footer";

const Layout = () => {
  return (
    <div className="layout">
      <Headers />
      <div className="main-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
