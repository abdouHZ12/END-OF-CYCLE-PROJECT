"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import GroupIcon from "@mui/icons-material/Group";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import Dashboard from "@/components/Dashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const currentUser = useCurrentUser();


  const items = [
    { label: "Tableau de bord",     href: "/manager",                   icon: <DashboardOutlinedIcon /> },
    { label: "Demandes en attente", href: "/manager/pending",           icon: <PendingActionsIcon /> },
    { label: "Historique employés", href: "/manager/employees-history", icon: <GroupIcon /> },
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

  // manager always has worker toggle (manager = worker too)
  // if also admin → show admin toggle instead
const toggleButton = (
  <Button
    onClick={() => router.push("/worker")}  // always go to worker first
    fullWidth variant="outlined"
    startIcon={<PersonOutlineOutlinedIcon fontSize="small" />}
    endIcon={<SwapHorizOutlinedIcon fontSize="small" />}
    sx={toggleSx}
  >
    Espace employé
  </Button>
);

  return (
    <Dashboard
      items={items}
      viewToggle={toggleButton}
      user={currentUser ? {
        initials: currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        name: currentUser.name,
        role: "Manager",
      } : undefined}
    >
      {children}
    </Dashboard>
  );
}