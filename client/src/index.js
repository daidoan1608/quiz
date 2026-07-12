import React from "react";
import ReactDOM from "react-dom/client";
import "./style/index.css";
import "./i18n";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { LanguageProvider } from "./context/LanguageProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();