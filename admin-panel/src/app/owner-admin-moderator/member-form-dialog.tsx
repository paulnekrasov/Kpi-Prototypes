"use client"

import React, { useState, useEffect, useId } from "react"
import {
  Plus,
  PencilSimple,
  ShieldCheck,
  ArrowsClockwise,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react"
import { Button } from "@components/ui/Button"
import { Dialog } from "@components/ui/Dialog"
import type { Member, MemberRole, Department } from "./roles-data"
import { MEMBER_ROLES, DEPARTMENTS } from "./roles-data"
import { cn } from "@components/utils/cn"

const roleBadgeStyles: Record<MemberRole, string> = {
  Owner:     "border-amber-200 bg-amber-50 text-amber-700",
  HR:        "border-pink-200 bg-pink-50 text-pink-700",
  Admin:     "border-indigo-200 bg-indigo-100 text-indigo-700",
  Moderator: "border-sky-200 bg-sky-100 text-sky-700",
  Support:   "border-pink-200 bg-pink-50 text-pink-700",
  External:  "border-(--border-subtle) bg-(--bg-subtle) text-(--text-muted)",
  Internal:  "border-emerald-200 bg-emerald-50 text-emerald-700",
  Media:     "border-pink-200 bg-pink-50 text-pink-700",
}

export interface MemberFormData {
  name: string
  roles: MemberRole[]
  gmail: string
  password: string
  notes: string
  department: Department
}

interface MemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingMember?: Member | null
  onSave: (data: MemberFormData) => void
}

function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789"
  const segments = [3, 4, 2]
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("")
    )
    .join("-")
}

export function MemberFormDialog({
  open,
  onOpenChange,
  editingMember,
  onSave,
}: MemberFormDialogProps) {
  const isEditing = !!editingMember
  const [showPassword, setShowPassword] = useState(false)

  const emptyForm: MemberFormData = {
    name: "",
    roles: [],
    gmail: "",
    password: "",
    notes: "",
    department: "Operations",
  }

  const [form, setForm] = useState<MemberFormData>(emptyForm)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (editingMember) {
        setForm({
          name: editingMember.name,
          roles: [...editingMember.roles],
          gmail: editingMember.gmail,
          password: editingMember.password,
          notes: editingMember.notes,
          department: editingMember.department,
        })
      } else {
        setForm({ ...emptyForm, password: generatePassword() })
      }
      setShowPassword(false)
    }
  }, [open, editingMember])

  const toggleRole = (role: MemberRole) => {
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
  const gmailId = useId()
  const passwordId = useId()
  const notesId = useId()
  const departmentId = useId()

  const inputClasses =
    "w-full min-h-[40px] rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-subtle) transition-[border-color,box-shadow] focus:border-(--color-brand) focus:shadow-[0_0_0_4px_var(--focus-ring)] focus:outline-none"

  const isValid =
    form.name.trim() !== "" &&
    form.roles.length > 0 &&
    form.gmail.trim() !== "" &&
    form.password.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="md">
        <Dialog.Header>
          <Dialog.Title>
            {isEditing ? "Edit Member" : "Add Member"}
          </Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>

        <form onSubmit={handleSubmit}>
          <Dialog.Body className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={nameId}
                className="text-sm font-medium text-(--text-primary)"
              >
                Full Name
                <span className="ml-0.5 text-(--color-destructive)">*</span>
              </label>
              <input
                id={nameId}
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Paul Nekrasov"
                className={inputClasses}
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={departmentId}
                className="text-sm font-medium text-(--text-primary)"
              >
                Department
                <span className="ml-0.5 text-(--color-destructive)">*</span>
              </label>
              <select
                id={departmentId}
                name="department"
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    department: e.target.value as Department,
                  }))
                }
                className={cn(inputClasses, "cursor-pointer")}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Roles multi-select */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-(--text-primary)">
                Roles
                <span className="ml-0.5 text-(--color-destructive)">*</span>
              </span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Select roles"
              >
                {MEMBER_ROLES.map((role) => {
                  const selected = form.roles.includes(role)
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex cursor-pointer select-none items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color,box-shadow] touch-action-manipulation",
                        "focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] focus-visible:outline-none",
                        selected
                          ? roleBadgeStyles[role]
                          : "border-(--border-subtle) bg-(--bg-base) text-(--text-muted) hover:border-(--color-brand-hover) hover:text-(--color-brand-hover)"
                      )}
                    >
                      {selected && (
                        <ShieldCheck
                          size={12}
                          weight="bold"
                          aria-hidden="true"
                        />
                      )}
                      {role}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Gmail */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={gmailId}
                className="text-sm font-medium text-(--text-primary)"
              >
                Gmail
                <span className="ml-0.5 text-(--color-destructive)">*</span>
              </label>
              <input
                id={gmailId}
                name="gmail"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                value={form.gmail}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gmail: e.target.value }))
                }
                placeholder="member@team.com…"
                className={inputClasses}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={passwordId}
                className="text-sm font-medium text-(--text-primary)"
              >
                Password
                <span className="ml-0.5 text-(--color-destructive)">*</span>
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={
                    isEditing ? "current-password" : "new-password"
                  }
                  spellCheck={false}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Enter password…"
                  className={cn(inputClasses, "pr-20")}
                />
                <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-(--text-muted) transition-colors hover:text-(--text-primary) focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] focus-visible:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeSlash size={14} aria-hidden="true" />
                    ) : (
                      <Eye size={14} aria-hidden="true" />
                    )}
                  </button>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          password: generatePassword(),
                        }))
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-(--text-muted) transition-colors hover:text-(--text-primary) focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] focus-visible:outline-none"
                      aria-label="Generate new password"
                    >
                      <ArrowsClockwise size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={notesId}
                className="text-sm font-medium text-(--text-primary)"
              >
                Notes
              </label>
              <textarea
                id={notesId}
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Optional notes about this member…"
                className={cn(inputClasses, "min-h-[72px] resize-y")}
              />
            </div>
          </Dialog.Body>

          <Dialog.Footer>
            <div className="flex items-center justify-end gap-3">
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
                disabled={!isValid}
                iconLeft={
                  isEditing ? (
                    <PencilSimple size={16} weight="bold" />
                  ) : (
                    <Plus size={16} weight="bold" />
                  )
                }
              >
                {isEditing ? "Save Changes" : "Add Member"}
              </Button>
            </div>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  )
}
