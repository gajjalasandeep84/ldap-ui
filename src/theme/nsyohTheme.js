import { createTheme } from "@mui/material/styles";

export const nsyohTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0B4F71", dark: "#083B54", contrastText: "#FFFFFF" },
    secondary: { main: "#F2B705", dark: "#D99F00", contrastText: "#0B4F71" },
    background: { default: "#EAF4FB", paper: "#FFFFFF" },
    divider: "#D6E4EE",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    h6: { fontWeight: 800 },
    subtitle1: { fontWeight: 700 },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { boxShadow: "none" } } },
    MuiPaper: { styleOverrides: { root: { border: "1px solid #D6E4EE" } } },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 800, borderRadius: 10 } },
    },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 800 } } },
  },
});
