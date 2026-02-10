import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./index.css";
import App from "./App.jsx";
import { nsyohTheme } from "./theme/nsyohTheme";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={nsyohTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
