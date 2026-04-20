"use client";
import Dashboard from "@/components/Dashboard";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import GroupIcon from "@mui/icons-material/Group";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

const EMPLOYEE_PATHS = [
  "/manager/my-dashboard",
  "/manager/my-requests",
  "/manager/my-history",
  "/manager/my-download",
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isEmployeeView = EMPLOYEE_PATHS.some((p) => pathname.startsWith(p));

  const managerItems = [
    { label: "Tableau de bord",     href: "/manager",                  icon: <DashboardOutlinedIcon /> },
    { label: "Demandes en attente", href: "/manager/pending",           icon: <PendingActionsIcon /> },
    { label: "Historique employés", href: "/manager/employees-history", icon: <GroupIcon /> },
  ];

  const employeeItems = [
    { label: "Tableau de bord",  href: "/manager/my-dashboard",    icon: <DashboardOutlinedIcon /> },
    { label: "Nouvelle demande", href: "/manager/my-requests/new", icon: <TextSnippetOutlinedIcon /> },
    { label: "Mes demandes",     href: "/manager/my-requests",     icon: <AssignmentOutlinedIcon /> },
    { label: "Historique",       href: "/manager/my-history",      icon: <RestoreOutlinedIcon /> },
  ];

  const toggleButton = (
    <Button
      onClick={() => {
        if (isEmployeeView) {
          router.push("/manager"); // go to manager space
        } else {
          router.push("/manager/my-dashboard"); // go to employee space
        }
      }}
      fullWidth
      variant="outlined"
      startIcon={
        isEmployeeView ? (
          <AdminPanelSettingsOutlinedIcon fontSize="small" />
        ) : (
          <PersonOutlineOutlinedIcon fontSize="small" />
        )
      }
      endIcon={<SwapHorizOutlinedIcon fontSize="small" />}
      sx={{
        justifyContent: "space-between",
        px: 1.5,
        py: 1,
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
      }}
    >
      {isEmployeeView ? "Espace manager" : "Mes demandes"}
    </Button>
  );

  return (
    <Dashboard
      items={isEmployeeView ? employeeItems : managerItems}
      viewToggle={toggleButton}
      user={{
        initials: "MG",
        name: "Manager",
        role: isEmployeeView ? "Employé" : "Manager",
      }}
    >
      {children}
    </Dashboard>
  );
}