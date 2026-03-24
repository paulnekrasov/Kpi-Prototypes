import React from "react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type BadgeVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "destructive"
  | "info";

type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-(--border-subtle-plus) bg-(--bg-subtle) text-(--text-muted)",
  brand: "border-(--border-brand)/20 bg-(--color-brand)/10 text-(--text-accent)",
  success: "border-(--status-success-border) bg-(--status-success-bg) text-(--color-success)",
  warning: "border-(--status-warning-border) bg-(--status-warning-bg) text-(--color-warning)",
  destructive:
    "border-(--status-destructive-border) bg-(--status-destructive-bg) text-(--color-destructive)",
  info: "border-(--status-info-border) bg-(--status-info-bg) text-(--color-info)",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium leading-none whitespace-nowrap",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
