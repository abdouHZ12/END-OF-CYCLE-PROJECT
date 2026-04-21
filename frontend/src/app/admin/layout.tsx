"use client";
import * as React from "react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import Dashboard from "@/components/Dashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser();
  const items = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <DashboardOutlinedIcon />,
    },
    {
      label: "Employees",
      href: "/admin/employees",
      icon: <PeopleOutlinedIcon />,
    },
    {
      label: "Register Employee",
      href: "/admin/employees/register",
      icon: <PersonAddOutlinedIcon />,
    },
    {
      label: "Roles",
      href: "/admin/roles",
      icon: <ManageAccountsOutlinedIcon />,
    },
    {
      label: "Departments",
      href: "/admin/departments",
      icon: <AccountTreeOutlinedIcon />,
    },
  ];

  return (
    <Dashboard
      items={items}
      user={
        currentUser
          ? {
              initials: currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              name: currentUser.name,
              role: currentUser.roles.includes("ADMIN") ? "Administrator" : currentUser.roles[0],
            }
          : undefined // falls back to "Employe Dupont / Employee" default
      }
    >
      {children}
    </Dashboard>
  );
}