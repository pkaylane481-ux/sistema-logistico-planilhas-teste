import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { SistemaProvider } from "./context/SistemaContext";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <SistemaProvider>
      <App />
    </SistemaProvider>
  </React.StrictMode>
);