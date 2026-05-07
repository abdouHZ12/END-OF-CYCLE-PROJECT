import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { getColors, type ThemeMode } from "./colors";

export function buildTheme(mode: ThemeMode) {
  const c = getColors(mode);

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: { main: c.brand, contrastText: c.onBrand },
      info: { main: c.info },
      success: { main: c.success },
      warning: { main: c.warning },
      error: { main: c.error },
      background: { default: c.bg, paper: c.surface1 },
      text: { primary: c.textPrimary, secondary: c.textSecondary },
      divider: c.border,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: "'Geist', system-ui, -apple-system, sans-serif",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.bg,
            color: c.textPrimary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  };

  return createTheme(options);
}
