"use client"

import React, { useState, useMemo, useCallback, useId } from "react"
import {
  MagnifyingGlass,
  Funnel,
  Plus,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  UserCircle,
  ArrowsDownUp,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react"
import { Table } from "@components/layout/table"
import { Pagination } from "@components/ui/pagination"
import { Button } from "@components/ui/Button"
import { IconButton } from "@components/ui/IconButton"
import { Badge } from "@components/ui/Badge"
import { Dialog } from "@components/ui/Dialog"
import { Tabs } from "@components/ui/Tabs"

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

// ─── Types ────────────────────────────────────────────────────────

type RoleName = "Owner" | "Admin" | "Moderator" | "HR" | "Analytics" | "Support"

const roleBadgeVariant: Record<RoleName, "owner" | "admin" | "moderator" | "hr" | "analytics" | "support"> = {
  Owner: "owner",
  Admin: "admin",
  Moderator: "moderator",
  HR: "hr",
  Analytics: "analytics",
  Support: "support",
}

interface Member {
  id: string
  name: string
  surname: string
  roles: RoleName[]
  email: string
  password: string
  notes: string
  createdAt: string
}

// ─── Mock data ────────────────────────────────────────────────────

const MOCK_MEMBERS: Member[] = [
  {
    id: "M-001",
    name: "Paul",
    surname: "Nekrasov",
    roles: ["Owner", "Admin"],
    email: "paul.nekrasov@gmail.com",
    password: "s3cur3P@ss!",
    notes: "Founder & lead administrator",
    createdAt: "2025-11-15T10:30:00",
  },
  {
    id: "M-002",
    name: "Anna",
    surname: "Kovalenko",
    roles: ["Admin"],
    email: "anna.kovalenko@gmail.com",
    password: "Adm!n2025#",
    notes: "Operations manager",
    createdAt: "2025-12-01T14:20:00",
  },
  {
    id: "M-003",
    name: "Dima",
    surname: "Petrov",
    roles: ["Moderator"],
    email: "dima.petrov@gmail.com",
    password: "m0dP@ss22",
    notes: "Content review lead",
    createdAt: "2026-01-10T09:15:00",
  },
  {
    id: "M-004",
    name: "Olena",
    surname: "Shevchenko",
    roles: ["HR"],
    email: "olena.shevchenko@gmail.com",
    password: "HrM@nager1",
    notes: "Human resources coordinator",
    createdAt: "2026-01-20T11:45:00",
  },
  {
    id: "M-005",
    name: "Maxim",
    surname: "Bondarenko",
    roles: ["Analytics"],
    email: "maxim.bondarenko@gmail.com",
    password: "D@ta2026!",
    notes: "Data analytics specialist",
    createdAt: "2026-02-05T16:00:00",
  },
  {
    id: "M-006",
    name: "Yulia",
    surname: "Lysenko",
    roles: ["Support"],
    email: "yulia.lysenko@gmail.com",
    password: "Supp0rt#1",
    notes: "Customer support team lead",
    createdAt: "2026-02-14T08:30:00",
  },
  {
    id: "M-007",
    name: "Artem",
    surname: "Melnyk",
    roles: ["Moderator", "Support"],
    email: "artem.melnyk@gmail.com",
    password: "Ar73m!Pwd",
    notes: "Reviews & escalations",
    createdAt: "2026-02-28T13:10:00",
  },
  {
    id: "M-008",
    name: "Oksana",
    surname: "Tkachenko",
    roles: ["Admin", "HR"],
    email: "oksana.tkachenko@gmail.com",
    password: "0ks@n@Hr",
    notes: "Administrative & HR duties",
    createdAt: "2026-03-05T10:00:00",
  },
]

interface Suggestion {
  id: string
  name: string
  surname: string
  suggestedRole: RoleName
  suggestedBy: string
  reason: string
  createdAt: string
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: "S-001",
    name: "Viktor",
    surname: "Savchenko",
    suggestedRole: "Moderator",
    suggestedBy: "Paul Nekrasov",
    reason: "Consistently reviews content with high accuracy",
    createdAt: "2026-03-18T09:30:00",
  },
  {
    id: "S-002",
    name: "Iryna",
    surname: "Moroz",
    suggestedRole: "Analytics",
    suggestedBy: "Anna Kovalenko",
    reason: "Strong background in data science",
    createdAt: "2026-03-20T14:15:00",
  },
  {
    id: "S-003",
    name: "Bohdan",
    surname: "Kravchenko",
    suggestedRole: "Support",
    suggestedBy: "Dima Petrov",
    reason: "Excellent communication skills, resolves tickets fast",
    createdAt: "2026-03-22T11:00:00",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────

function getInitials(name: string, surname: string) {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
}

const initialsColors = [
  "bg-[#E7F1FF] text-[#1D4ED8]",
  "bg-[#F3E8FF] text-[#7C3AED]",
  "bg-[#FFF1F5] text-[#B91C5A]",
  "bg-[#ECFDF5] text-[#047857]",
  "bg-[#FFFBEB] text-[#B45309]",
  "bg-[#EDE9FE] text-[#6D28D9]",
]

function getInitialColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return initialsColors[Math.abs(hash) % initialsColors.length]
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

function formatTime(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

const AVAILABLE_ROLES: RoleName[] = ["Owner", "Admin", "Moderator", "HR", "Analytics", "Support"]
const PAGE_SIZE = 6

// ─── Masked Cell Component ───────────────────────────────────────

function MaskedCell({
  value,
  maskChar = "•",
  label,
}: {
  value: string
  maskChar?: string
  label: string
}) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("text-sm", !revealed && "tracking-wider")}>
        {revealed ? value : maskChar.repeat(8)}
      </span>
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="inline-flex items-center justify-center w-6 h-6 rounded text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-subtle) transition-colors focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]"
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

// ─── Avatar ──────────────────────────────────────────────────────

function Avatar({ name, surname }: { name: string; surname: string }) {
  const initials = getInitials(name, surname)
  const color = getInitialColor(name + surname)

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold flex-shrink-0 select-none",
        color
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

// ─── Empty State ─────────────────────────────────────────────────

function EmptyState({ message, description }: { message: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-full bg-(--bg-subtle) flex items-center justify-center">
        <MagnifyingGlass size={24} className="text-(--text-muted)" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-(--text-primary) text-wrap-balance text-center">
        {message}
      </p>
      {description && (
        <p className="text-sm text-(--text-muted) text-wrap-pretty text-center max-w-xs">
          {description}
        </p>
      )}
    </div>
  )
}

// ─── Delete Confirmation Dialog ──────────────────────────────────

function DeleteDialog({
  open,
  onOpenChange,
  memberName,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  onConfirm: () => void
}) {
  const [answer, setAnswer] = useState("")
  const [a] = useState(() => Math.floor(Math.random() * 20) + 1)
  const [b] = useState(() => Math.floor(Math.random() * 20) + 1)
  const correctAnswer = a + b
  const isCorrect = answer.trim() === String(correctAnswer)
  const verifyId = useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="max-w-md">
        <Dialog.Header>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-(--status-destructive-bg) flex items-center justify-center flex-shrink-0">
              <Trash size={20} className="text-(--color-destructive)" aria-hidden="true" />
            </div>
            <div>
              <Dialog.Title>Delete Member</Dialog.Title>
              <Dialog.Description>
                This action cannot be undone.
              </Dialog.Description>
            </div>
          </div>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <p className="text-sm text-(--text-primary) mb-4 text-wrap-pretty">
            Are you sure you want to remove <strong>{memberName}</strong> from the team? All their
            access and permissions will be revoked immediately.
          </p>
          <div className="flex flex-col gap-2">
            <label htmlFor={verifyId} className="text-sm font-medium text-(--text-primary)">
              To confirm, solve: {a}&nbsp;+&nbsp;{b}&nbsp;=&nbsp;?
            </label>
            <input
              id={verifyId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter answer…"
              className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) text-(--text-primary) text-sm placeholder:text-(--text-subtle) focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_4px_var(--focus-ring)] transition-[border-color,box-shadow]"
            />
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <button
            type="button"
            disabled={!isCorrect}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
              setAnswer("")
            }}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-[background-color,opacity,transform] touch-action-manipulation",
              "bg-(--color-destructive) text-white border-none",
              "hover:opacity-90 active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring-error)]",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            )}
          >
            <Trash size={16} weight="bold" aria-hidden="true" />
            Delete Member
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}

// ─── Create / Edit Member Dialog ─────────────────────────────────

interface MemberFormData {
  name: string
  surname: string
  roles: RoleName[]
  email: string
  password: string
  notes: string
}

function MemberFormDialog({
  open,
  onOpenChange,
  editingMember,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingMember?: Member | null
  onSave: (data: MemberFormData) => void
}) {
  const isEditing = !!editingMember
  const [form, setForm] = useState<MemberFormData>({
    name: editingMember?.name ?? "",
    surname: editingMember?.surname ?? "",
    roles: editingMember?.roles ?? [],
    email: editingMember?.email ?? "",
    password: editingMember?.password ?? "",
    notes: editingMember?.notes ?? "",
  })

  // Reset form when member changes
  React.useEffect(() => {
    if (open) {
      setForm({
        name: editingMember?.name ?? "",
        surname: editingMember?.surname ?? "",
        roles: editingMember?.roles ?? [],
        email: editingMember?.email ?? "",
        password: editingMember?.password ?? "",
        notes: editingMember?.notes ?? "",
      })
    }
  }, [open, editingMember])

  const toggleRole = (role: RoleName) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    onOpenChange(false)
  }

  const nameId = useId()
  const surnameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const notesId = useId()

  const inputClasses =
    "w-full min-h-[40px] px-3 py-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) text-(--text-primary) text-sm placeholder:text-(--text-subtle) focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_4px_var(--focus-ring)] transition-[border-color,box-shadow]"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>{isEditing ? "Edit Member" : "Add Member"}</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <form onSubmit={handleSubmit}>
          <Dialog.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={nameId} className="text-sm font-medium text-(--text-primary)">
                  Name<span className="text-(--color-destructive) ml-0.5">*</span>
                </label>
                <input
                  id={nameId}
                  name="name"
                  required
                  autoComplete="given-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="First name…"
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={surnameId} className="text-sm font-medium text-(--text-primary)">
                  Surname<span className="text-(--color-destructive) ml-0.5">*</span>
                </label>
                <input
                  id={surnameId}
                  name="surname"
                  required
                  autoComplete="family-name"
                  value={form.surname}
                  onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))}
                  placeholder="Last name…"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Roles multi-select */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-(--text-primary)">
                Roles<span className="text-(--color-destructive) ml-0.5">*</span>
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select roles">
                {AVAILABLE_ROLES.map((role) => {
                  const selected = form.roles.includes(role)
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color,box-shadow] cursor-pointer select-none touch-action-manipulation",
                        "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]",
                        selected
                          ? "bg-(--color-brand) text-(--text-on-accent) border-(--color-brand)"
                          : "bg-(--bg-base) text-(--text-muted) border-(--border-subtle) hover:border-(--color-brand-hover) hover:text-(--color-brand-hover)"
                      )}
                    >
                      {selected && <ShieldCheck size={12} weight="bold" aria-hidden="true" />}
                      {role}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailId} className="text-sm font-medium text-(--text-primary)">
                Gmail<span className="text-(--color-destructive) ml-0.5">*</span>
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="member@gmail.com…"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={passwordId} className="text-sm font-medium text-(--text-primary)">
                Password<span className="text-(--color-destructive) ml-0.5">*</span>
              </label>
              <input
                id={passwordId}
                name="password"
                type="password"
                required
                autoComplete={isEditing ? "current-password" : "new-password"}
                spellCheck={false}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Enter password…"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={notesId} className="text-sm font-medium text-(--text-primary)">
                Notes
              </label>
              <textarea
                id={notesId}
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Optional notes about this member…"
                className={cn(inputClasses, "resize-y min-h-[72px]")}
              />
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!form.name || !form.surname || form.roles.length === 0 || !form.email || !form.password}
              iconLeft={isEditing ? <PencilSimple size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
            >
              {isEditing ? "Save Changes" : "Add Member"}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  )
}

// ─── Filter Dropdown ─────────────────────────────────────────────

function FilterDropdown({
  selectedRole,
  onSelect,
}: {
  selectedRole: RoleName | "all"
  onSelect: (role: RoleName | "all") => void
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
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
        {selectedRole === "all" ? "Filter" : selectedRole}
      </Button>
      {open && (
        <div
          role="listbox"
          aria-label="Filter by role"
          className="absolute top-full left-0 mt-1 w-44 rounded-lg border border-(--border-subtle) bg-(--bg-base) shadow-[var(--shadow-subtle-active)] z-50 py-1 animate-[dialogIn_150ms_ease-out]"
        >
          <button
            type="button"
            role="option"
            aria-selected={selectedRole === "all"}
            onClick={() => { onSelect("all"); setOpen(false) }}
            className={cn(
              "w-full text-left px-3 py-2 text-sm transition-colors",
              selectedRole === "all"
                ? "bg-(--bg-subtle) text-(--color-brand) font-medium"
                : "text-(--text-primary) hover:bg-(--bg-subtle)"
            )}
          >
            All Roles
          </button>
          {AVAILABLE_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              role="option"
              aria-selected={selectedRole === role}
              onClick={() => { onSelect(role); setOpen(false) }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors",
                selectedRole === role
                  ? "bg-(--bg-subtle) text-(--color-brand) font-medium"
                  : "text-(--text-primary) hover:bg-(--bg-subtle)"
              )}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// ─── Main Roles Page ─────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState("members")
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<RoleName | "all">("all")
  const [page, setPage] = useState(1)
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS)
  const [suggestions] = useState<Suggestion[]>(MOCK_SUGGESTIONS)

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const searchId = useId()

  // Filtered members
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        search === "" ||
        `${m.name} ${m.surname}`.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())

      const matchesRole = filterRole === "all" || m.roles.includes(filterRole)

      return matchesSearch && matchesRole
    })
  }, [members, search, filterRole])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedMembers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page when filters change
  React.useEffect(() => { setPage(1) }, [search, filterRole])

  // CRUD handlers
  const handleDelete = useCallback(() => {
    if (memberToDelete) {
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id))
      setMemberToDelete(null)
    }
  }, [memberToDelete])

  const handleSave = useCallback(
    (data: MemberFormData) => {
      if (editingMember) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editingMember.id
              ? { ...m, ...data }
              : m
          )
        )
      } else {
        const newId = `M-${String(members.length + 1).padStart(3, "0")}`
        setMembers((prev) => [
          ...prev,
          {
            ...data,
            id: newId,
            createdAt: new Date().toISOString(),
          },
        ])
      }
      setEditingMember(null)
    },
    [editingMember, members.length]
  )

  const openCreate = () => {
    setEditingMember(null)
    setFormDialogOpen(true)
  }

  const openEdit = (member: Member) => {
    setEditingMember(member)
    setFormDialogOpen(true)
  }

  const openDelete = (member: Member) => {
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="flex-1 min-w-0 p-6 lg:p-8">
      {/* Page Header */}
      <header className="mb-6">
        <h1
          className="text-2xl font-semibold text-(--text-primary) tracking-tight text-wrap-balance"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Roles
        </h1>
        <p className="text-sm text-(--text-muted) mt-1">
          {members.length} members
        </p>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs.List>
            <Tabs.Trigger value="members">Members</Tabs.Trigger>
            <Tabs.Trigger value="suggestions" count={suggestions.length}>
              Suggestions
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* ── Members Tab ────────────────────────────────────── */}
        <Tabs.Content value="members">
          {/* Actions bar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id={searchId}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, or email…"
                  autoComplete="off"
                  className="w-full min-h-[36px] pl-9 pr-3 py-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-base) text-(--text-primary) text-sm placeholder:text-(--text-subtle) focus:outline-none focus:border-(--color-brand) focus:shadow-[0_0_0_4px_var(--focus-ring)] transition-[border-color,box-shadow]"
                />
              </div>
              <FilterDropdown selectedRole={filterRole} onSelect={setFilterRole} />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={openCreate}
              iconLeft={<Plus size={16} weight="bold" />}
            >
              Add Member
            </Button>
          </div>

          {/* Table */}
          {pagedMembers.length === 0 ? (
            <EmptyState
              message="No Members Found"
              description="Try adjusting your search or filters to find the member you are looking for."
            />
          ) : (
            <>
              <div className="rounded-xl border border-(--border-subtle) overflow-hidden">
                <Table>
                  <Table.Header>
                    <Table.Row className="hover:bg-transparent">
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) w-20">
                        ID
                      </Table.Head>
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                        Name&nbsp;&amp;&nbsp;Surname
                      </Table.Head>
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                        Roles
                      </Table.Head>
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                        Gmail
                      </Table.Head>
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) w-28">
                        Password
                      </Table.Head>
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) hidden xl:table-cell">
                        Notes
                      </Table.Head>
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) hidden lg:table-cell w-28">
                        Created
                      </Table.Head>
                      <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) w-24 text-right">
                        Actions
                      </Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {pagedMembers.map((member) => (
                      <Table.Row key={member.id}>
                        <Table.Cell className="text-xs text-(--text-muted) font-mono tabular-nums">
                          {member.id}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={member.name} surname={member.surname} />
                            <span className="text-sm font-medium text-(--text-primary) truncate max-w-[150px]">
                              {member.name} {member.surname}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-wrap gap-1">
                            {member.roles.map((role) => (
                              <Badge key={role} variant={roleBadgeVariant[role]}>
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <MaskedCell value={member.email} label="email" maskChar="•" />
                        </Table.Cell>
                        <Table.Cell>
                          <MaskedCell value={member.password} label="password" maskChar="•" />
                        </Table.Cell>
                        <Table.Cell className="hidden xl:table-cell">
                          <span className="text-sm text-(--text-muted) line-clamp-1 max-w-[180px]">
                            {member.notes || "—"}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="hidden lg:table-cell">
                          <div className="text-sm text-(--text-muted) tabular-nums">
                            <div>{formatDate(member.createdAt)}</div>
                            <div className="text-xs text-(--text-subtle)">{formatTime(member.createdAt)}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(member)}
                              aria-label={`Edit ${member.name} ${member.surname}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-(--text-muted) hover:text-(--color-brand) hover:bg-(--bg-subtle) transition-colors focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]"
                            >
                              <PencilSimple size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDelete(member)}
                              aria-label={`Delete ${member.name} ${member.surname}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-(--text-muted) hover:text-(--color-destructive) hover:bg-(--status-destructive-bg) transition-colors focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring-error)]"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}>
                    <Pagination.Prev />
                    <Pagination.Pages />
                    <Pagination.Next />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Tabs.Content>

        {/* ── Suggestions Tab ────────────────────────────────── */}
        <Tabs.Content value="suggestions">
          {suggestions.length === 0 ? (
            <EmptyState
              message="No Suggestions Yet"
              description="Role suggestions from team leads will appear here."
            />
          ) : (
            <div className="rounded-xl border border-(--border-subtle) overflow-hidden">
              <Table>
                <Table.Header>
                  <Table.Row className="hover:bg-transparent">
                    <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) w-20">
                      ID
                    </Table.Head>
                    <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                      Candidate
                    </Table.Head>
                    <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                      Suggested Role
                    </Table.Head>
                    <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                      Suggested By
                    </Table.Head>
                    <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) hidden md:table-cell">
                      Reason
                    </Table.Head>
                    <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) hidden lg:table-cell">
                      Date
                    </Table.Head>
                    <Table.Head className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted) w-24 text-right">
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {suggestions.map((s) => (
                    <Table.Row key={s.id}>
                      <Table.Cell className="text-xs text-(--text-muted) font-mono tabular-nums">
                        {s.id}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.name} surname={s.surname} />
                          <span className="text-sm font-medium text-(--text-primary)">
                            {s.name} {s.surname}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={roleBadgeVariant[s.suggestedRole]}>
                          {s.suggestedRole}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-(--text-muted)">{s.suggestedBy}</span>
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell">
                        <span className="text-sm text-(--text-muted) line-clamp-1 max-w-[200px]">
                          {s.reason}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <span className="text-sm text-(--text-muted) tabular-nums">
                          {formatDate(s.createdAt)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="primary" size="sm" className="text-xs h-7 px-2.5">
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" className="text-xs h-7 px-2.5">
                            Reject
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Tabs.Content>
      </Tabs>

      {/* Dialogs */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        memberName={memberToDelete ? `${memberToDelete.name} ${memberToDelete.surname}` : ""}
        onConfirm={handleDelete}
      />

      <MemberFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editingMember={editingMember}
        onSave={handleSave}
      />
    </div>
  )
}
