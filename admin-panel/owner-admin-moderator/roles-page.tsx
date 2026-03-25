"use client"

import React, {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Eye,
  EyeSlash,
  Funnel,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
  UsersThree,
} from "@phosphor-icons/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Table } from "@components/layout/table"
import { Button } from "@components/ui/Button"
import { Pagination } from "@components/ui/pagination"
import { Badge } from "@components/ui/Badge"
import { Tabs } from "@components/ui/Tabs"
import {
  DEPARTMENTS,
  INITIAL_MEMBERS,
  INITIAL_SUGGESTIONS,
  MEMBER_ROLES,
  type Department,
  type Member,
  type MemberRole,
  type Suggestion,
  type SuggestionStatus,
} from "./roles-data"
import { DeleteDialog } from "./delete-dialog"
import { MemberFormDialog, type MemberFormData } from "./member-form-dialog"
import { cn } from "@components/utils/cn"

// ─── Constants ──────────────────────────────────────────────────────

const PAGE_SIZE = 6

const roleBadgeVariant: Record<
  MemberRole,
  "destructive" | "brand" | "warning" | "info"
> = {
  Owner: "destructive",
  Admin: "brand",
  Moderator: "warning",
  "Media Rep": "info",
}

const suggestionStatusVariant: Record<
  SuggestionStatus,
  "neutral" | "warning" | "success" | "destructive"
> = {
  New: "neutral",
  "In Review": "warning",
  Approved: "success",
  Declined: "destructive",
}

// Avatar colors — maps to existing token triplets, zero new tokens
const AVATAR_STYLES = [
  "bg-(--color-brand)/10 text-(--text-accent)",
  "bg-(--status-success-bg) text-(--color-success)",
  "bg-(--status-warning-bg) text-(--color-warning)",
  "bg-(--status-info-bg) text-(--color-info)",
  "bg-(--status-destructive-bg) text-(--color-destructive)",
  "bg-(--bg-subtle) text-(--text-muted)",
] as const

// ─── Helpers ────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getAvatarStyle(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_STYLES[Math.abs(hash) % AVATAR_STYLES.length]
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

// ─── Inline sub-components ──────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg text-xs font-semibold",
        getAvatarStyle(name)
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}

function MaskedCell({ value, label }: { value: string; label: string }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("text-sm", !revealed && "tracking-wider")}>
        {revealed ? value : "••••••••"}
      </span>
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="inline-flex h-6 w-6 items-center justify-center rounded text-(--text-muted) transition-colors hover:bg-(--bg-subtle) hover:text-(--text-primary) focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] focus-visible:outline-none"
        aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
        aria-pressed={revealed}
      >
        {revealed ? (
          <EyeSlash size={14} weight="regular" aria-hidden="true" />
        ) : (
          <Eye size={14} weight="regular" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

function EmptyState({
  message,
  description,
}: {
  message: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-subtle)">
        <UsersThree
          size={24}
          className="text-(--text-muted)"
          aria-hidden="true"
        />
      </div>
      <p className="text-center text-sm font-medium text-(--text-primary) text-wrap-balance">
        {message}
      </p>
      {description && (
        <p className="max-w-xs text-center text-sm text-(--text-muted) text-wrap-pretty">
          {description}
        </p>
      )}
    </div>
  )
}

// ─── Filter Dropdown ────────────────────────────────────────────────

function FilterDropdown({
  selectedRole,
  onSelect,
}: {
  selectedRole: MemberRole | "all"
  onSelect: (role: MemberRole | "all") => void
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const allOptions: (MemberRole | "all")[] = ["all", ...MEMBER_ROLES]

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return

    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="option"]'
    )
    if (!buttons) return
    const items = Array.from(buttons)
    const focused = document.activeElement as HTMLElement
    const idx = items.indexOf(focused as HTMLButtonElement)

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        items[Math.min(idx + 1, items.length - 1)]?.focus()
        break
      case "ArrowUp":
        e.preventDefault()
        items[Math.max(idx - 1, 0)]?.focus()
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  // Focus the first option when opening
  useEffect(() => {
    if (open) {
      const selected = listRef.current?.querySelector<HTMLButtonElement>(
        '[aria-selected="true"]'
      )
      selected?.focus()
    }
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(!open)}
        iconLeft={<Funnel size={16} />}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selectedRole === "all" ? "All Roles" : selectedRole}
      </Button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Filter by role"
          onKeyDown={handleKeyDown}
          className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-(--border-subtle) bg-(--bg-base) py-1 shadow-[var(--shadow-subtle-active)] animate-[dialogIn_150ms_ease-out]"
        >
          {allOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selectedRole === option}
              onClick={() => {
                onSelect(option)
                setOpen(false)
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors focus:bg-(--bg-subtle) focus:outline-none",
                selectedRole === option
                  ? "bg-(--bg-subtle) font-medium text-(--color-brand)"
                  : "text-(--text-primary) hover:bg-(--bg-subtle)"
              )}
            >
              {option === "all" ? "All Roles" : option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Shared table head class ────────────────────────────────────────

const thClass =
  "text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)"

// ═════════════════════════════════════════════════════════════════════
// ─── Main Roles Page ────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════

type DialogState =
  | { type: "create" }
  | { type: "edit"; member: Member }
  | { type: "delete"; member: Member }
  | null

export default function RolesPage() {
  // URL-based tab state (syncs with sidebar navigation in dashboard-shell)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab =
    searchParams.get("tab") === "suggestions" ? "suggestions" : "members"

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", tab)
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, router, pathname]
  )

  // Data state
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [suggestions, setSuggestions] =
    useState<Suggestion[]>(INITIAL_SUGGESTIONS)

  // UI state
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<MemberRole | "all">("all")
  const [page, setPage] = useState(1)
  const [dialogState, setDialogState] = useState<DialogState>(null)

  const searchId = useId()

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterRole])

  // Filtered & paged members
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = search.toLowerCase()
      const matchesSearch =
        q === "" ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.gmail.toLowerCase().includes(q)

      const matchesRole =
        filterRole === "all" || m.roles.includes(filterRole)

      return matchesSearch && matchesRole
    })
  }, [members, search, filterRole])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedMembers = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // CRUD handlers
  const handleSave = useCallback(
    (data: MemberFormData) => {
      if (dialogState?.type === "edit") {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === dialogState.member.id ? { ...m, ...data } : m
          )
        )
      } else {
        const maxId = members.reduce(
          (max, m) =>
            Math.max(max, parseInt(m.id.replace("M-", ""), 10)),
          0
        )
        setMembers((prev) => [
          ...prev,
          {
            ...data,
            id: `M-${String(maxId + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
          },
        ])
      }
      setDialogState(null)
    },
    [dialogState, members]
  )

  const handleDelete = useCallback(() => {
    if (dialogState?.type === "delete") {
      setMembers((prev) =>
        prev.filter((m) => m.id !== dialogState.member.id)
      )
      setDialogState(null)
    }
  }, [dialogState])

  const handleSuggestionStatus = useCallback(
    (id: string, status: SuggestionStatus) => {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      )
    },
    []
  )

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* Page header */}
      <header>
        <h1
          className="text-2xl font-semibold tracking-tight text-(--text-primary) text-wrap-balance"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Roles
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          {members.length} members · {suggestions.length} suggestions
        </p>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs.List>
            <Tabs.Trigger value="members" count={members.length}>
              Members
            </Tabs.Trigger>
            <Tabs.Trigger value="suggestions" count={suggestions.length}>
              Suggestions
            </Tabs.Trigger>
          </Tabs.List>

          {activeTab === "members" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDialogState({ type: "create" })}
              iconLeft={<Plus size={16} weight="bold" />}
            >
              Add Member
            </Button>
          )}
        </div>

        {/* ── Members Tab ─────────────────────────────────────────── */}
        <Tabs.Panel value="members">
          {/* Search + filter bar */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 max-w-md">
              <MagnifyingGlass
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
                aria-hidden="true"
              />
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or email…"
                autoComplete="off"
                className="w-full min-h-[36px] rounded-lg border border-(--border-subtle) bg-(--bg-base) py-1.5 pl-9 pr-3 text-sm text-(--text-primary) placeholder:text-(--text-subtle) transition-[border-color,box-shadow] focus:border-(--color-brand) focus:shadow-[0_0_0_4px_var(--focus-ring)] focus:outline-none"
              />
            </div>
            <FilterDropdown
              selectedRole={filterRole}
              onSelect={setFilterRole}
            />
          </div>

          {/* Table */}
          {pagedMembers.length === 0 ? (
            <EmptyState
              message="No Members Found"
              description="Try adjusting your search or filters to find the member you are looking for."
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-(--border-subtle)">
                <Table>
                  <Table.Header>
                    <Table.Row className="hover:bg-transparent">
                      <Table.Head className={cn(thClass, "w-20")}>
                        ID
                      </Table.Head>
                      <Table.Head className={thClass}>Name</Table.Head>
                      <Table.Head className={thClass}>Roles</Table.Head>
                      <Table.Head className={thClass}>Gmail</Table.Head>
                      <Table.Head className={cn(thClass, "w-28")}>
                        Password
                      </Table.Head>
                      <Table.Head
                        className={cn(thClass, "hidden xl:table-cell")}
                      >
                        Department
                      </Table.Head>
                      <Table.Head
                        className={cn(
                          thClass,
                          "hidden lg:table-cell w-28"
                        )}
                      >
                        Created
                      </Table.Head>
                      <Table.Head
                        className={cn(thClass, "w-24 text-right")}
                      >
                        Actions
                      </Table.Head>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {pagedMembers.map((member) => (
                      <Table.Row key={member.id}>
                        <Table.Cell className="font-mono text-xs tabular-nums text-(--text-muted)">
                          {member.id}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={member.name} />
                            <span className="max-w-[150px] truncate text-sm font-medium text-(--text-primary)">
                              {member.name}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-wrap gap-1">
                            {member.roles.map((role) => (
                              <Badge
                                key={role}
                                variant={roleBadgeVariant[role]}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <MaskedCell
                            value={member.gmail}
                            label="email"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <MaskedCell
                            value={member.password}
                            label="password"
                          />
                        </Table.Cell>
                        <Table.Cell className="hidden xl:table-cell">
                          <Badge variant="neutral">
                            {member.department}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="hidden lg:table-cell">
                          <div className="tabular-nums text-sm text-(--text-muted)">
                            <div>{formatDate(member.createdAt)}</div>
                            <div className="text-xs text-(--text-subtle)">
                              {formatTime(member.createdAt)}
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setDialogState({
                                  type: "edit",
                                  member,
                                })
                              }
                              aria-label={`Edit ${member.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--text-muted) transition-colors hover:bg-(--bg-subtle) hover:text-(--color-brand) focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] focus-visible:outline-none"
                            >
                              <PencilSimple
                                size={16}
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDialogState({
                                  type: "delete",
                                  member,
                                })
                              }
                              aria-label={`Delete ${member.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--text-muted) transition-colors hover:bg-(--status-destructive-bg) hover:text-(--color-destructive) focus-visible:shadow-[0_0_0_4px_var(--focus-ring-error)] focus-visible:outline-none"
                            >
                              <Trash size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  >
                    <Pagination.Prev />
                    <Pagination.Pages />
                    <Pagination.Next />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Tabs.Panel>

        {/* ── Suggestions Tab ─────────────────────────────────────── */}
        <Tabs.Panel value="suggestions">
          {suggestions.length === 0 ? (
            <EmptyState
              message="No Suggestions Yet"
              description="Role suggestions from team leads will appear here."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-(--border-subtle)">
              <Table>
                <Table.Header>
                  <Table.Row className="hover:bg-transparent">
                    <Table.Head className={cn(thClass, "w-24")}>
                      ID
                    </Table.Head>
                    <Table.Head className={cn(thClass, "w-20")}>
                      Type
                    </Table.Head>
                    <Table.Head className={thClass}>Member</Table.Head>
                    <Table.Head className={thClass}>Title</Table.Head>
                    <Table.Head
                      className={cn(thClass, "hidden md:table-cell")}
                    >
                      Department
                    </Table.Head>
                    <Table.Head className={cn(thClass, "w-24")}>
                      Status
                    </Table.Head>
                    <Table.Head
                      className={cn(
                        thClass,
                        "hidden lg:table-cell w-28"
                      )}
                    >
                      Date
                    </Table.Head>
                    <Table.Head
                      className={cn(thClass, "w-40 text-right")}
                    >
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {suggestions.map((s) => (
                    <Table.Row key={s.id}>
                      <Table.Cell className="font-mono text-xs tabular-nums text-(--text-muted)">
                        {s.id}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          variant={
                            s.type === "Delete"
                              ? "destructive"
                              : s.type === "Create"
                                ? "success"
                                : "brand"
                          }
                        >
                          {s.type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.memberName} />
                          <span className="text-sm font-medium text-(--text-primary)">
                            {s.memberName}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="max-w-[200px] text-sm text-(--text-primary) line-clamp-1">
                          {s.title}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell">
                        <Badge variant="neutral">{s.department}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={suggestionStatusVariant[s.status]}>
                          {s.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <span className="text-sm tabular-nums text-(--text-muted)">
                          {formatDate(s.createdAt)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status !== "Approved" &&
                            s.status !== "Declined" && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="h-7 px-2.5 text-xs"
                                  onClick={() =>
                                    handleSuggestionStatus(
                                      s.id,
                                      "Approved"
                                    )
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 px-2.5 text-xs"
                                  onClick={() =>
                                    handleSuggestionStatus(
                                      s.id,
                                      "Declined"
                                    )
                                  }
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                          {(s.status === "Approved" ||
                            s.status === "Declined") && (
                            <span className="text-xs italic text-(--text-subtle)">
                              {s.status}
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Dialogs */}
      <MemberFormDialog
        open={
          dialogState?.type === "create" || dialogState?.type === "edit"
        }
        onOpenChange={(open) => {
          if (!open) setDialogState(null)
        }}
        editingMember={
          dialogState?.type === "edit" ? dialogState.member : null
        }
        onSave={handleSave}
      />

      <DeleteDialog
        open={dialogState?.type === "delete"}
        onOpenChange={(open) => {
          if (!open) setDialogState(null)
        }}
        memberName={
          dialogState?.type === "delete" ? dialogState.member.name : ""
        }
        onConfirm={handleDelete}
      />
    </>
  )
}
