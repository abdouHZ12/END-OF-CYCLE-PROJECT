export type ThemeMode = "light" | "dark";

type ThemeColors = {
  bg: string;
  surface0: string;
  surface1: string;
  surface2: string;
  surface2Hover: string;
  surface3: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandStrong: string;
  brandHover: string;
  brandMuted: string;
  brandMutedStrong: string;
  brandGhost: string;
  brandBorder: string;
  brandBorderStrong: string;
  onBrand: string;
  info: string;
  infoMuted: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  hover: string;
  shadowStrong: string;
  shadowSoft: string;
  // ── Shell (sidebar + topbar) ──────────────────────────────────────────
  shellBg: string;
  shellText: string;
  shellTextMuted: string;
  shellBorder: string;
  shellHover: string;
};

export const darkColors: ThemeColors = {
  bg: "#12213a",
  surface0: "#10223A",
  surface1: "#1a2742",
  surface2: "#1a2942",
  surface2Hover: "#1a2540",
  surface3: "#20314E",
  border: "#243652",
  borderSubtle: "rgba(255,255,255,0.12)",
  textPrimary: "#FFFFFF",
  textSecondary: "#C9D1E1",
  textMuted: "#9AA3B2",
  brand: "#FFA500",
  brandStrong: "#FF9800",
  brandHover: "#FFB733",
  brandMuted: "rgba(255,165,0,0.12)",
  brandMutedStrong: "rgba(255,165,0,0.18)",
  brandGhost: "rgba(255,165,0,0.06)",
  brandBorder: "rgba(255,165,0,0.3)",
  brandBorderStrong: "rgba(255,165,0,0.45)",
  onBrand: "#0A1628",
  info: "#7FB3FF",
  infoMuted: "rgba(127,179,255,0.1)",
  success: "#4CAF50",
  successMuted: "rgba(76,175,80,0.1)",
  warning: "#F97316",
  warningMuted: "rgba(249,115,22,0.12)",
  error: "#F44336",
  errorMuted: "rgba(244,67,54,0.1)",
  hover: "rgba(255,255,255,0.05)",
  shadowStrong: "0px 4px 16px rgba(0,0,0,0.4), 0px 1px 4px rgba(0,0,0,0.2)",
  shadowSoft: "0px 1px 3px rgba(0,0,0,0.2), 0px 4px 12px rgba(0,0,0,0.15)",
  // Shell stays dark navy in dark mode too — consistent identity
  shellBg: "#0D1B3E",
  shellText: "#C9D1E1",
  shellTextMuted: "#7A8599",
  shellBorder: "rgba(255,255,255,0.08)",
  shellHover: "rgba(255,255,255,0.06)",
};

export const lightColors: ThemeColors = {
  // App background
  bg: "#F7F9FC",
  // Surfaces (cards/sidebar/topbar)
  surface0: "#FFFFFF",
  surface1: "#FFFFFF",
  surface2: "#FFFFFF",
  surface2Hover: "#F1F5F9",
  surface3: "#FFFFFF",
  // Borders + text
  border: "#E5E7EB",
  borderSubtle: "#E5E7EB",
  textPrimary: "#1F2937",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  // Accent (Naftal yellow)
  brand: "#F5A000",
  brandStrong: "#D98D00",
  brandHover: "#FFB21A",
  brandMuted: "rgba(245,160,0,0.14)",
  brandMutedStrong: "rgba(245,160,0,0.22)",
  brandGhost: "rgba(245,160,0,0.08)",
  brandBorder: "rgba(245,160,0,0.35)",
  brandBorderStrong: "rgba(245,160,0,0.55)",
  // Text on accent backgrounds (use primary brand blue)
  onBrand: "#0B3C5D",
  // Primary brand blue used for secondary actions + info
  info: "#0B3C5D",
  infoMuted: "rgba(11,60,93,0.10)",
  // Status colors
  success: "#16A34A",
  successMuted: "rgba(22,163,74,0.10)",
  warning: "#F97316",
  warningMuted: "rgba(249,115,22,0.12)",
  error: "#DC2626",
  errorMuted: "rgba(220,38,38,0.10)",
  hover: "rgba(31,41,55,0.05)",
  // Shadows (soft, modern)
  shadowStrong: "0px 10px 22px rgba(15, 23, 42, 0.10)",
  shadowSoft: "0px 6px 18px rgba(15, 23, 42, 0.08)",
  // Shell (sidebar + topbar): white in light mode
  shellBg: "#FFFFFF",
  shellText: "#1F2937",
  shellTextMuted: "#6B7280",
  shellBorder: "#E5E7EB",
  shellHover: "rgba(31,41,55,0.05)",
};

export function getColors(mode: ThemeMode) {
  return mode === "light" ? lightColors : darkColors;
}