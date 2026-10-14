import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PwaUpdate } from "./PwaUpdate";
import "./style.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <PwaUpdate />
  </React.StrictMode>,
);
