import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ForgeWeb from "./ForgeWeb.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ForgeWeb />
  </React.StrictMode>
);
