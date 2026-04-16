"use client";
import Dashboard from "@/components/Dashboard";
import * as React from "react";
// manager icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import GroupIcon from "@mui/icons-material/Group";
// employee icons  
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [view, setView] = React.useState<"manager" | "employee">("manager");

  const managerItems = [
    { label: "Tableau de bord", href: "/manager", icon: <DashboardOutlinedIcon /> },
    { label: "Demandes en attente", href: "/manager/pending", icon: <PendingActionsIcon /> },
    { label: "Historique employés", href: "/manager/employees-history", icon: <GroupIcon /> },
  ];

  const employeeItems = [
    { label: "Tableau de bord", href: "/manager/my-dashboard", icon: <DashboardOutlinedIcon /> },
    { label: "Nouvelle demande", href: "/manager/my-requests/new", icon: <TextSnippetOutlinedIcon /> },
    { label: "Mes demandes", href: "/manager/my-requests", icon: <AssignmentOutlinedIcon /> },
    { label: "Historique", href: "/manager/my-history", icon: <RestoreOutlinedIcon /> },
  ];

  // Pass a toggle button as an extra prop to Dashboard
  const toggleButton = (
    <button onClick={() => setView(v => v === "manager" ? "employee" : "manager")}>
      {view === "manager" ? "👤 Mes demandes" : "📋 Espace manager"}
    </button>
  );

  return (
    <Dashboard 
      items={view === "manager" ? managerItems : employeeItems}
      viewToggle={toggleButton}         // ← new prop to add to Dashboard
      user={{ initials: "MG", name: "Manager", role: view === "manager" ? "Manager" : "Employé" }}
    >
      {children}
    </Dashboard>
  );
}