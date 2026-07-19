import React from "react";
import ReactDOM from "react-dom/client";
import "./style/index.css";
import "./i18n";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div className="notranslate" translate="no">
      <App />
    </div>
  </React.StrictMode>
);
