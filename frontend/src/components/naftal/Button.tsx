"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export default function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--naftal-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--naftal-bg)] disabled:opacity-60 disabled:pointer-events-none";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--naftal-brand)] text-[var(--naftal-on-brand)] hover:bg-[var(--naftal-brand-hover)]",
    secondary:
      "bg-[var(--naftal-info)] text-white hover:opacity-90",
    outline:
      "border border-[var(--naftal-border)] bg-transparent text-[var(--naftal-text-secondary)] hover:bg-[var(--naftal-hover)] hover:text-[var(--naftal-text-primary)]",
    ghost:
      "bg-transparent text-[var(--naftal-text-secondary)] hover:bg-[var(--naftal-hover)] hover:text-[var(--naftal-text-primary)]",
  };

  return (
    <button
      type={type}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
