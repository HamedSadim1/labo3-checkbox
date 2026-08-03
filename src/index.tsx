import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "@/App";
import { ThemeProvider } from "@/context/ThemeProvider";
import { FilterProvider } from "@/context/FilterProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <FilterProvider>
        <App />
      </FilterProvider>
    </ThemeProvider>
  </React.StrictMode>
);
