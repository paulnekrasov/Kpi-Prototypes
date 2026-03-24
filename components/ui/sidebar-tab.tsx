"use client"

import * as React from "react"
import { useSidebar } from "@components/layout/sidebar"

export interface SidebarTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: React.ReactNode
  label: string
}

export const SidebarTab = React.forwardRef<HTMLButtonElement, SidebarTabProps>(
  ({ className = "", active = false, icon, label, role, type, disabled, ...props }, ref) => {
    const { collapsed } = useSidebar()
    const [showTooltip, setShowTooltip] = React.useState(false)
    const ariaSelected = role === "tab" ? active : props["aria-selected"]

    const button = (
      <button
        ref={ref}
        type={type ?? "button"}
        role={role}
        aria-selected={ariaSelected}
        aria-label={collapsed ? label : undefined}
        disabled={disabled}
        data-slot="sidebar-tab"
        data-state={active ? "active" : "inactive"}
        className={["sidebar-tab", active && "active", collapsed && "collapsed", className]
          .filter(Boolean)
          .join(" ")}
        onMouseEnter={() => collapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => collapsed && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        {...props}
      >
        {icon ? (
          <span className="sidebar-tab-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span
          className="sidebar-tab-label"
          aria-hidden={collapsed ? "true" : undefined}
        >
          {label}
        </span>
      </button>
    )

    if (!collapsed) return button

    const tooltipText = disabled ? `${label} (unavailable)` : label

    return (
      <div className="sidebar-tab-wrapper">
        {button}
        {showTooltip && (
          <div className="sidebar-tooltip" role="tooltip" aria-hidden="true">
            {tooltipText}
          </div>
        )}
      </div>
    )
  },
)

SidebarTab.displayName = "SidebarTab"
