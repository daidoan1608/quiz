// src/App.js
import React from "react";
import { AppProviders } from "./context/AppProviders";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
