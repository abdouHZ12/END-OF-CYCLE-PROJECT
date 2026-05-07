"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import GroupIcon from "@mui/icons-material/Group";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import DashboardShell from "@/components/naftal/DashboardShell";
import Button from "@/components/naftal/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CardTravelIcon from '@mui/icons-material/CardTravel';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter();
  const currentUser = useCurrentUser();

  const employeeHref = "/worker";


  const items = [
    { label: "Tableau de bord",     href: "/manager",                   icon: <DashboardOutlinedIcon /> },
    { label: "Demandes en attente", href: "/manager/pending",           icon: <PendingActionsIcon /> },
    { label: "Mission Order",       href: "/manager/mission-order",     icon: <CardTravelIcon /> },
    { label: "Historique employés", href: "/manager/employees-history", icon: <GroupIcon /> },
  ];

  const toggleButton = (
    <Button
      onClick={() => router.push(employeeHref)}
      variant="outline"
      className="w-full justify-between border-(--naftal-brand-border) bg-(--naftal-brand-ghost) text-(--naftal-info) hover:bg-(--naftal-brand-muted)"
    >
      <span className="inline-flex items-center gap-2">
        <PersonOutlineOutlinedIcon fontSize="small" />
        Espace worker
      </span>
      <SwapHorizOutlinedIcon fontSize="small" />
    </Button>
  );

  return (
    <DashboardShell
      items={items}
      viewToggle={toggleButton}
      user={currentUser ? {
        initials: currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        name: currentUser.name,
        role: "Manager",
      } : undefined}
    >
      {children}
    </DashboardShell>
  );
}