"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import Dashboard from "@/components/Dashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const currentUser = useCurrentUser();

  const roles     = currentUser?.roles ?? [];
  const isManager = roles.includes("MANAGER");
  const isWorker  = roles.includes("WORKER");

  const items = [
    { label: "Dashboard",         href: "/admin",                    icon: <DashboardOutlinedIcon /> },
    { label: "Employees",         href: "/admin/employees",          icon: <PeopleOutlinedIcon /> },
    { label: "Register Employee", href: "/admin/employees/register", icon: <PersonAddOutlinedIcon /> },
    { label: "Roles",             href: "/admin/roles",              icon: <ManageAccountsOutlinedIcon /> },
    { label: "Departments",       href: "/admin/departments",        icon: <AccountTreeOutlinedIcon /> },
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

  // admin + manager → go to /manager (manager layout handles /worker from there)
  // admin + worker only → go to /worker
  const showToggle = isManager || isWorker;
  const toggleHref = isManager ? "/manager" : "/worker";

  const toggleButton = showToggle ? (
    <Button
      onClick={() => router.push(toggleHref)}
      fullWidth variant="outlined"
      startIcon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
      endIcon={<SwapHorizOutlinedIcon fontSize="small" />}
      sx={toggleSx}
    >
      {isManager ? "Espace manager" : "Espace employé"}
    </Button>
  ) : undefined;

  return (
    <Dashboard
      items={items}
      viewToggle={toggleButton}
      user={currentUser ? {
        initials: currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        name: currentUser.name,
        role: "Administrateur",
      } : undefined}
    >
      {children}
    </Dashboard>
  );
}