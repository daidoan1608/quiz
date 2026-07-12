// Layout.js
import React from "react";
import Headers from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="layout aura-page min-h-screen flex flex-col transition-colors duration-300">
      <Headers />
      <main className="main-content flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
