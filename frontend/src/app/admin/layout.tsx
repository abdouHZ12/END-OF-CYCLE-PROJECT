"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import DashboardShell from "@/components/naftal/DashboardShell";
import Button from "@/components/naftal/Button";
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

  // admin + manager → go to /manager (manager layout handles /worker from there)
  // admin + worker only → go to /worker
  const showToggle = isManager || isWorker;
  const toggleHref = isManager ? "/manager" : isWorker ? "/worker" : "";

  const toggleButton = showToggle ? (
    <Button
      onClick={() => router.push(toggleHref)}
      variant="outline"
      className="w-full justify-between border-(--naftal-brand-border) bg-(--naftal-brand-ghost) text-(--naftal-info) hover:bg-(--naftal-brand-muted)"
    >
      <span className="inline-flex items-center gap-2">
        <AdminPanelSettingsOutlinedIcon fontSize="small" />
        {isManager ? "Espace manager" : isWorker ? "Espace employé" : ""}
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
        role: "Administrateur",
      } : undefined}
    >
      {children}
    </DashboardShell>
  );
}