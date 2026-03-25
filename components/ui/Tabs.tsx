"use client";

import * as React from "react";
import { cn } from "@components/utils/cn";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>.");
  }

  return context;
}

interface TabsRootProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function TabsRoot({ value, onValueChange, children, className }: TabsRootProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-[20px] border border-(--border-subtle-plus) bg-(--bg-subtle) p-2 shadow-[var(--shadow-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  count?: number;
  icon?: React.ReactNode;
}

function TabsTrigger({
  className,
  value,
  count,
  icon,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const active = activeValue === value;
  const triggerId = `tab-trigger-${value}`;
  const panelId = `tab-panel-${value}`;

  return (
    <button
      id={triggerId}
      type="button"
      role="tab"
      aria-controls={panelId}
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium tracking-[-0.02em] transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]",
        active
          ? "border-(--border-brand) bg-(--bg-base) text-(--text-primary) shadow-[var(--shadow-subtle-active)]"
          : "border-transparent bg-transparent text-(--text-muted) hover:border-(--border-subtle-plus) hover:bg-(--bg-base) hover:text-(--text-primary)",
        className,
      )}
      {...props}
    >
      {icon ? <span aria-hidden="true" className="shrink-0 text-current">{icon}</span> : null}
      <span>{children}</span>
      {count !== undefined ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-(--border-brand)/20 bg-(--color-brand)/10 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-(--text-accent)">
          {count}
        </span>
      ) : null}
    </button>
  );
}

interface TabsPanelProps extends React.ComponentProps<"div"> {
  value: string;
}

function TabsPanel({ className, value, ...props }: TabsPanelProps) {
  const { value: activeValue } = useTabsContext();
  const active = activeValue === value;
  const triggerId = `tab-trigger-${value}`;
  const panelId = `tab-panel-${value}`;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={triggerId}
      hidden={!active}
      className={cn(active ? "block" : "hidden", className)}
      {...props}
    />
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
  Content: TabsPanel,
});
