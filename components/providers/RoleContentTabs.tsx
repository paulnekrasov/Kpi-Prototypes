"use client";

import * as React from "react";
import { cn } from "@components/utils/cn";

export type RoleContentTabValue = "members" | "suggestions";

interface RoleContentTabItem {
  label: string;
  value: RoleContentTabValue;
}

interface RoleContentTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: readonly RoleContentTabItem[];
  value: RoleContentTabValue;
  onValueChange: (value: RoleContentTabValue) => void;
}

export function RoleContentTabs({
  className,
  items,
  value,
  onValueChange,
  ...props
}: RoleContentTabsProps) {
  return (
    <div
      data-slot="role-content-tabs"
      className={cn(
        "inline-flex shrink-0 items-center gap-3 rounded-[8px] border border-(--border-subtle-plus) bg-(--bg-subtle) p-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            data-state={active ? "active" : "inactive"}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-[6px] border px-3 text-[14px] font-medium leading-[1.3] tracking-[-0.15px]",
              "transition-[background-color,color,border-color,box-shadow] duration-150 ease-out",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]",
              active
                ? "border-(--border-brand) bg-(--bg-base) text-(--text-accent) shadow-[var(--shadow-subtle-active)]"
                : "border-transparent text-(--text-muted) hover:bg-(--bg-base) hover:text-(--text-primary)",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
