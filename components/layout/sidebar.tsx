"use client"

import * as React from "react"
import { CaretUpDown, Sidebar as SidebarIcon } from "@phosphor-icons/react"
import { Logo } from "@components/layout/Logo"
import { cn } from "@components/utils/cn"

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
  className,
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
        className={cn("sidebar", collapsed && "collapsed", className)}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────
// Wraps Header + Nav to push Footer to the bottom via flex: 1.
// Provides the 24px gap between header and nav per Figma spec.

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div
      data-slot="sidebar-upper"
      className={cn("sidebar-upper", className)}
    >
      {children}
    </div>
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
  className,
}: SidebarHeaderProps) {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <div
      data-slot="sidebar-header"
      className={cn("sidebar-header", className)}
    >
      <div className="sidebar-header-content">
        {collapsed ? (
          <button
            type="button"
            className="sidebar-header-logo-btn"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
          >
            {logo ?? <Logo variant="icon" />}
          </button>
        ) : (
          <span aria-hidden="true">{logo ?? <Logo variant="icon" />}</span>
        )}
        {!collapsed && (
          <button
            type="button"
            className="sidebar-header-team"
            onClick={onTeamClick}
            aria-label={`Switch team \u2014 current: ${teamName}`}
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

function SidebarNav({ children, className }: SidebarNavProps) {
  return (
    <nav
      data-slot="sidebar-nav"
      aria-label="Main navigation"
      className={cn("sidebar-nav", className)}
    >
      {children}
    </nav>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

// Avatar initials from a name string
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

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
  className,
}: SidebarFooterProps) {
  const { collapsed } = useSidebar()

  return (
    <div
      data-slot="sidebar-footer"
      className={cn("sidebar-footer", className)}
    >
      <div className="sidebar-footer-content">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={avatarAlt ?? userName}
            className="sidebar-footer-avatar"
          />
        ) : (
          <span className="sidebar-footer-initials" aria-hidden="true">
            {getInitials(userName)}
          </span>
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
  Content: SidebarContent,
  Header: SidebarHeader,
  Nav: SidebarNav,
  Footer: SidebarFooter,
})
