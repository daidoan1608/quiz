import React from "react";
import { AppMessageHost } from './components/common/AppMessageHost';
import { AppProviders } from "./context/AppProviders";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <AppProviders>
      <AppRouter />
      <AppMessageHost />
    </AppProviders>
  );
}

export default App;
