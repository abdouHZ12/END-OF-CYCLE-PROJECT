"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import Dashboard from "@/components/Dashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const currentUser = useCurrentUser();

  const roles     = currentUser?.roles ?? [];

  const items = [
    { label: "Tableau de bord",  href: "/agent",              icon: <DashboardOutlinedIcon /> },
    { label: "Nouvelle demande", href: "/agent/fill-request", icon: <TextSnippetOutlinedIcon /> },
    { label: "Mes demandes",     href: "/agent/my-requests",  icon: <AssignmentOutlinedIcon /> },
    { label: "Historique",       href: "/agent/history",      icon: <RestoreOutlinedIcon /> },
    { label: "Scanner",          href: "/agent/scan",         icon: <QrCodeScannerOutlinedIcon /> },
  ];

  const toggleSx = {
    justifyContent: "space-between",
    px: 1.5, py: 1,
    backgroundColor: "rgba(255,165,0,0.12)",
    color: "#ffa500",
    borderColor: "rgba(255,165,0,0.3)",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "13px",
    fontWeight: 700,
    "&:hover": {
      backgroundColor: "rgba(255,165,0,0.18)",
      borderColor: "rgba(255,165,0,0.45)",
    },
  } as const;

  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const showToggle = isAdmin || isManager;

  const toggleButton = showToggle ? (
    <Button
      onClick={() => router.push(isAdmin ? "/admin" : "/manager")}
      fullWidth variant="outlined"
      startIcon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
      endIcon={<SwapHorizOutlinedIcon fontSize="small" />}
      sx={toggleSx}
    >
      {isAdmin ? "Espace admin" : "Espace manager"}
    </Button>
  ) : undefined;

  return (
    <Dashboard
      items={items}
      viewToggle={toggleButton}
      user={currentUser ? {
        initials: currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        name: currentUser.name,
        role: "Agent",
      } : undefined}
    >
      {children}
    </Dashboard>
  );
}