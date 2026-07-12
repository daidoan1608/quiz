// src/App.js
import React from "react";
import { AppProviders } from "./context/AppProviders";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./routes/ScrollToTop";

function App() {
  return (
    <AppProviders>
      <ScrollToTop />
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
