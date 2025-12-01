import React from "react";
import Sidebar from "../components/common/Sidebar";
import Content from "./Content";
import "../styles/dashboard.css";

export default function Display() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard--content">
        <Content />
      </div>
    </div>
  );
}
