"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { buildTheme } from "@/theme/theme";
import { getColors, type ThemeMode } from "@/theme/colors";

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = React.createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = "naftal.theme";

function applyCssVars(mode: ThemeMode) {
  const root = document.documentElement;
  const c = getColors(mode);

  root.dataset.theme = mode;
  root.style.colorScheme = mode;

  root.style.setProperty("--naftal-bg", c.bg);
  root.style.setProperty("--naftal-surface-0", c.surface0);
  root.style.setProperty("--naftal-surface-1", c.surface1);
  root.style.setProperty("--naftal-surface-2", c.surface2);
  root.style.setProperty("--naftal-surface-2-hover", c.surface2Hover);
  root.style.setProperty("--naftal-surface-3", c.surface3);
  root.style.setProperty("--naftal-border", c.border);
  root.style.setProperty("--naftal-border-subtle", c.borderSubtle);
  root.style.setProperty("--naftal-text-primary", c.textPrimary);
  root.style.setProperty("--naftal-text-secondary", c.textSecondary);
  root.style.setProperty("--naftal-text-muted", c.textMuted);
  root.style.setProperty("--naftal-brand", c.brand);
  root.style.setProperty("--naftal-brand-strong", c.brandStrong);
  root.style.setProperty("--naftal-brand-hover", c.brandHover);
  root.style.setProperty("--naftal-brand-muted", c.brandMuted);
  root.style.setProperty("--naftal-brand-muted-strong", c.brandMutedStrong);
  root.style.setProperty("--naftal-brand-ghost", c.brandGhost);
  root.style.setProperty("--naftal-brand-border", c.brandBorder);
  root.style.setProperty("--naftal-brand-border-strong", c.brandBorderStrong);
  root.style.setProperty("--naftal-on-brand", c.onBrand);
  root.style.setProperty("--naftal-info", c.info);
  root.style.setProperty("--naftal-info-muted", c.infoMuted);
  root.style.setProperty("--naftal-success", c.success);
  root.style.setProperty("--naftal-success-muted", c.successMuted);
  root.style.setProperty("--naftal-warning", c.warning);
  root.style.setProperty("--naftal-warning-muted", c.warningMuted);
  root.style.setProperty("--naftal-error", c.error);
  root.style.setProperty("--naftal-error-muted", c.errorMuted);
  root.style.setProperty("--naftal-hover", c.hover);
  root.style.setProperty("--naftal-shadow-strong", c.shadowStrong);
  root.style.setProperty("--naftal-shadow-soft", c.shadowSoft);
  root.style.setProperty("--naftal-shell-bg", c.shellBg);
  root.style.setProperty("--naftal-shell-text", c.shellText);
  root.style.setProperty("--naftal-shell-text-muted", c.shellTextMuted);
  root.style.setProperty("--naftal-shell-border", c.shellBorder);
  root.style.setProperty("--naftal-shell-hover", c.shellHover);
  }

// Bridge: apply CSS vars immediately on client before first render
if (typeof window !== "undefined") {
  const stored = localStorage.getItem(STORAGE_KEY);
  const bootstrapMode: ThemeMode =
    stored === "light" || stored === "dark" ? stored : "light";
  applyCssVars(bootstrapMode);
}

export function ThemeModeProvider({
  children,
  forcedMode,
}: {
  children: React.ReactNode;
  forcedMode?: ThemeMode;
}) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<ThemeMode>(forcedMode ?? "light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (forcedMode) {
      setMode(forcedMode);
      applyCssVars(forcedMode);
      setMounted(true);
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    const resolved: ThemeMode =
      stored === "light" || stored === "dark"
        ? stored
        : prefersDark ? "dark" : "light";
    setMode(resolved);
    setMounted(true);
  }, [prefersDark, forcedMode]);

  React.useEffect(() => {
    if (!mounted) return;
    if (!forcedMode) {
      // Don't persist forced mode — it's page-scoped, not a user preference
      localStorage.setItem(STORAGE_KEY, mode);
    }
    applyCssVars(mode);
  }, [mode, mounted, forcedMode]);

  const theme = React.useMemo(() => buildTheme(mode), [mode]);

  const value = React.useMemo(
    () => ({
      mode,
      toggleMode: () => {
        if (forcedMode) return; // no-op when mode is forced
        setMode((prev) => (prev === "dark" ? "light" : "dark"));
      },
      setMode: (next: ThemeMode) => {
        if (forcedMode) return; // no-op when mode is forced
        setMode(next);
      },
    }),
    [mode, forcedMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = React.useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return ctx;
}