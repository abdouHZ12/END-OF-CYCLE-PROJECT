"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useThemeMode } from "@/components/theme/ThemeModeProvider";

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  items: SidebarItem[];
  viewToggle?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
};

export default function Sidebar({
  items,
  viewToggle,
  footer,
  className,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <aside
      className={cn(
        "h-full bg-(--naftal-surface-1) text-(--naftal-text-primary)",
        className
      )}
    >
      <div className="flex h-full flex-col">
        <div className="px-5 pt-6 pb-4">
          <div
            className={cn(
              "text-left text-2xl font-extrabold tracking-wide",
              isDark ? "text-(--naftal-brand)" : "text-(--naftal-info)"
            )}
          >
            NAFTAL
          </div>
          <div className="mt-2 h-0.5 w-16 bg-(--naftal-brand)" />
        </div>

        <div className="border-t border-(--naftal-border-subtle)" />

        {viewToggle ? <div className="px-4 pt-4">{viewToggle}</div> : null}

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-(--naftal-brand) text-(--naftal-on-brand)"
                        : "text-(--naftal-text-secondary) hover:bg-(--naftal-hover) hover:text-(--naftal-text-primary)"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        isActive
                          ? "text-(--naftal-on-brand)"
                          : "text-(--naftal-text-muted)"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1 whitespace-normal wrap-break-word leading-snug">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {footer ? (
          <div className="border-t border-(--naftal-border-subtle)">{footer}</div>
        ) : null}
      </div>
    </aside>
  );
}
