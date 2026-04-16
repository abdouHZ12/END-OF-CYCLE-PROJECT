"use client";
import Dashboard from "@/components/Dashboard";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import GroupIcon from "@mui/icons-material/Group";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";

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
    <button
      onClick={() => {
        if (isEmployeeView) {
          router.push("/manager"); // go to manager space
        } else {
          router.push("/manager/my-dashboard"); // go to employee space
        }
      }}
      style={{
        width: "100%",
        padding: "8px 12px",
        backgroundColor: "rgba(255,165,0,0.12)",
        color: "#ffa500",
        border: "1px solid rgba(255,165,0,0.3)",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "bold",
        textAlign: "left",
      }}
    >
      {isEmployeeView ? "📋 Espace manager" : "👤 Mes demandes"}
    </button>
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