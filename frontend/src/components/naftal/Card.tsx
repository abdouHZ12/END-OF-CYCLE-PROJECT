import * as React from "react";
import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-(--naftal-surface-1) shadow-(--naftal-shadow-soft) border border-(--naftal-border-subtle)",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold text-(--naftal-text-secondary)",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("text-xs text-(--naftal-text-muted)", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}
