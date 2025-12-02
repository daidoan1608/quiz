import React from "react";
import Sidebar from "../components/common/Sidebar";
import Content from "./Content";
import "../styles/dashboard.css";
import { ContentHeader } from "../components/common/Header";

export default function Display() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content-area">
        <ContentHeader />
        <div className="scrollable-content">
          <Content />
        </div>
      </div>
    </div>
  );
}
