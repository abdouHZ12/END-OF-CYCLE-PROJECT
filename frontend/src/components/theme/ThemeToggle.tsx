"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useThemeMode } from "@/components/theme/ThemeModeProvider";

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const label = mode === "dark" ? "Passer en mode clair" : "Passer en mode sombre";

  return (
    <Tooltip title={label} arrow>
      <IconButton
        aria-label={label}
        onClick={toggleMode}
        sx={{
          color: "var(--naftal-text-primary)",
          border: "1px solid var(--naftal-border)",
          bgcolor: "var(--naftal-surface-1)",
          width: 36,
          height: 36,
          "&:hover": { bgcolor: "var(--naftal-surface-2)" },
        }}
      >
        {mode === "dark" ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
