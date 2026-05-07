import * as React from "react";
import { cn } from "@/lib/cn";

type Status = "APPROVED" | "PENDING" | "REJECTED" | string;

export default function Badge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVED: {
      label: "Approved",
      cls: "bg-[var(--naftal-success-muted)] text-[var(--naftal-success)] border-[var(--naftal-success)]",
    },
    PENDING: {
      label: "Pending",
      cls: "bg-[var(--naftal-warning-muted)] text-[var(--naftal-warning)] border-[var(--naftal-warning)]",
    },
    REJECTED: {
      label: "Rejected",
      cls: "bg-[var(--naftal-error-muted)] text-[var(--naftal-error)] border-[var(--naftal-error)]",
    },
  };

  const v = map[status] ?? {
    label: String(status),
    cls: "bg-[var(--naftal-hover)] text-[var(--naftal-text-secondary)] border-[var(--naftal-border)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold",
        v.cls,
        className
      )}
    >
      {v.label}
    </span>
  );
}
