"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import DashboardShell from "@/components/naftal/DashboardShell";
import Button from "@/components/naftal/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CardTravelIcon from '@mui/icons-material/CardTravel';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const currentUser = useCurrentUser();

  const roles     = currentUser?.roles ?? [];

  const items = [
    {
      label: "Tableau de bord",
      href: "/worker",
      icon: <DashboardOutlinedIcon />,
    },
    {
      label: "Nouvelle demande",
      href: "/worker/fill-request",
      icon: <TextSnippetOutlinedIcon />,
    },
    {
      label: "Mes demandes",
      href: "/worker/my-requests",
      icon: <AssignmentOutlinedIcon />,
    },
    {
      label: "Mes missions",
      href: "/worker/my-missions",
      icon: <CardTravelIcon />,
    },
    {
      label: "Historique",
      href: "/worker/history",
      icon: <RestoreOutlinedIcon />,
    },
    {
      label: "Télécharger autorisation",
      href: "/worker/download-auth",
      icon: <FileDownloadOutlinedIcon />,
    },
  ];

  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const showToggle = isAdmin || isManager;

  const toggleButton = showToggle ? (
    <Button
      onClick={() => router.push(isAdmin ? "/admin" : "/manager")}
      variant="outline"
      className="w-full justify-between border-(--naftal-brand-border) bg-(--naftal-brand-ghost) text-(--naftal-info) hover:bg-(--naftal-brand-muted)"
    >
      <span className="inline-flex items-center gap-2">
        <AdminPanelSettingsOutlinedIcon fontSize="small" />
        {isAdmin ? "Espace admin" : "Espace manager"}
      </span>
      <SwapHorizOutlinedIcon fontSize="small" />
    </Button>
  ) : undefined;

  return (
    <DashboardShell
      items={items}
      viewToggle={toggleButton}
      user={currentUser ? {
        initials: currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        name: currentUser.name,
        role: roles.includes("AGENT") ? "Agent" : "Employé",
      } : undefined}
    >
      {children}
    </DashboardShell>
  );
}