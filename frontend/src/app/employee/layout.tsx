
"use client";

import * as React from "react";

// icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Dashboard from "@/components/Dashboard";
export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // sidebar configuration (IMPORTANT: NOT JSX)
  const items = [
    {
      label: "Tableau de bord",
      href: "/employee",
      icon: <DashboardOutlinedIcon />,
    },
    {
      label: "Nouvelle demande",
      href: "/employee/fill-request",
      icon: <TextSnippetOutlinedIcon />,
    },
    {
      label: "Mes demandes",
      href: "/employee/requests",
      icon: <AssignmentOutlinedIcon />,
    },
    {
      label: "Historique",
      href: "/employee/history",
      icon: <RestoreOutlinedIcon />,
    },
    {
      label: "Télécharger autorisation",
      href: "/employee/download",
      icon: <FileDownloadOutlinedIcon />,
    },
  ];

  return (
    <Dashboard items={items}>
      {children}
    </Dashboard>
  );
}
