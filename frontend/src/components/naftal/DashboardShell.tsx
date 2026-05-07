"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import Sidebar, { type SidebarItem } from "@/components/naftal/Sidebar";
import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationPanel from "@/components/NotificationPanel";
import { useLogout } from "@/hooks/useLogout";

const drawerWidthPx = 260;

type DashboardUser = {
  initials: string;
  name: string;
  role: string;
};

type DashboardShellProps = {
  items: SidebarItem[];
  children: React.ReactNode;
  user?: DashboardUser;
  viewToggle?: React.ReactNode;
};

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

export default function DashboardShell({
  items,
  children,
  user: userProp,
  viewToggle,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { logout, isLoggingOut } = useLogout();

  const user: DashboardUser =
    userProp ?? ({ initials: "ED", name: "Employe Dupont", role: "Employé" } as const);

  const footer = (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl font-extrabold border border-(--naftal-brand-border) bg-transparent text-(--naftal-brand)">
          {user.initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-(--naftal-text-primary)">
            {user.name}
          </div>
          <div className="truncate text-xs text-(--naftal-text-muted)">
            {user.role}
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        disabled={isLoggingOut}
        className={cn(
          "mt-4 w-full rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
          "text-(--naftal-error) hover:bg-(--naftal-error-muted) disabled:opacity-60"
        )}
      >
        Déconnexion
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh bg-(--naftal-bg) text-(--naftal-text-primary)">
      {/* Desktop sidebar */}
      <div
        className="hidden sm:fixed sm:inset-y-0 sm:left-0 sm:block sm:border-r sm:border-(--naftal-border) sm:shadow-(--naftal-shadow-soft)"
        style={{ width: drawerWidthPx }}
      >
        <Sidebar items={items} viewToggle={viewToggle} footer={footer} />
      </div>

      {/* Mobile overlay sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 sm:hidden",
          mobileOpen ? "" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/30 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-(--naftal-surface-1) shadow-(--naftal-shadow-soft) transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ width: drawerWidthPx }}
        >
          <Sidebar
            items={items}
            viewToggle={viewToggle}
            footer={footer}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Main */}
      <div className="sm:pl-65">
        <header
          className="fixed top-0 z-30 h-17.5 w-full border-b border-(--naftal-border) bg-(--naftal-surface-1) sm:left-65 sm:w-[calc(100%-260px)]"
        >
          <div className="mx-auto flex h-full items-center gap-3 px-4">
            <button
              className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--naftal-border) bg-(--naftal-surface-1) text-(--naftal-text-primary) hover:bg-(--naftal-hover)"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <NotificationPanel />
              <ThemeToggle />

<div className="hidden sm:flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-xl font-extrabold border border-(--naftal-brand-border) bg-transparent text-(--naftal-brand)">
    {user.initials}
  </div>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-(--naftal-text-primary)">
                    {user.name}
                  </div>
                  <div className="text-xs text-(--naftal-text-muted)">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
