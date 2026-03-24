"use client"

import * as React from "react"
import { CaretUpDown, Sidebar as SidebarIcon } from "@phosphor-icons/react"
import { Logo } from "@components/layout/Logo"

// ─── Context ──────────────────────────────────────────────────────────────────

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
})

export function useSidebar(): SidebarContextValue {
  return React.useContext(SidebarContext)
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  className?: string
}

function SidebarRoot({
  children,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapse,
  className = "",
}: SidebarProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed)
  const isControlled = controlledCollapsed !== undefined
  const collapsed = isControlled ? controlledCollapsed! : uncontrolled

  const setCollapsed = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolled(value)
      onCollapse?.(value)
    },
    [isControlled, onCollapse],
  )

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <aside
        data-slot="sidebar"
        data-collapsed={collapsed}
        className={["sidebar", collapsed && "collapsed", className].filter(Boolean).join(" ")}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface SidebarHeaderProps {
  logo?: React.ReactNode
  teamName?: string
  onTeamClick?: () => void
  className?: string
}

function SidebarHeader({
  logo,
  teamName = "Media Team",
  onTeamClick,
  className = "",
}: SidebarHeaderProps) {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <div
      data-slot="sidebar-header"
      className={["sidebar-header", className].filter(Boolean).join(" ")}
    >
      <div className="sidebar-header-content">
        <span aria-hidden="true">{logo ?? <Logo variant="icon" />}</span>
        {!collapsed && (
          <button
            type="button"
            className="sidebar-header-team"
            onClick={onTeamClick}
            aria-label={`Switch team — current: ${teamName}`}
          >
            <span className="sidebar-header-team-name">{teamName}</span>
            <CaretUpDown size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        <SidebarIcon size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

interface SidebarNavProps {
  children: React.ReactNode
  className?: string
}

function SidebarNav({ children, className = "" }: SidebarNavProps) {
  return (
    <nav
      data-slot="sidebar-nav"
      aria-label="Main navigation"
      className={["sidebar-nav", className].filter(Boolean).join(" ")}
    >
      {children}
    </nav>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

interface SidebarFooterProps {
  avatarSrc?: string
  avatarAlt?: string
  userName?: string
  userRole?: string
  onUserClick?: () => void
  className?: string
}

function SidebarFooter({
  avatarSrc,
  avatarAlt,
  userName = "Paul Nekrasov",
  userRole = "Admin",
  onUserClick,
  className = "",
}: SidebarFooterProps) {
  const { collapsed } = useSidebar()

  return (
    <div
      data-slot="sidebar-footer"
      className={["sidebar-footer", className].filter(Boolean).join(" ")}
    >
      <div className="sidebar-footer-content">
        {avatarSrc && (
          <img
            src={avatarSrc}
            alt={avatarAlt ?? userName}
            className="sidebar-footer-avatar"
          />
        )}
        {!collapsed && (
          <div className="sidebar-footer-text">
            <span className="sidebar-footer-name">{userName}</span>
            <span className="sidebar-footer-role">{userRole}</span>
          </div>
        )}
      </div>
      {!collapsed && (
        <button
          type="button"
          className="sidebar-footer-action"
          onClick={onUserClick}
          aria-label="Open user menu"
        >
          <CaretUpDown size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

// ─── Compound export ──────────────────────────────────────────────────────────

export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Nav: SidebarNav,
  Footer: SidebarFooter,
})
