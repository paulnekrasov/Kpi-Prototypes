

"use client"

import React, { useState, useEffect, useId } from "react"
import { Trash } from "@phosphor-icons/react"
import { Button } from "@components/ui/Button"
import { Dialog } from "@components/ui/Dialog"
import { cn } from "@components/utils/cn"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  onConfirm: () => void
}

export function DeleteDialog({
  open,
  onOpenChange,
  memberName,
  onConfirm,
}: DeleteDialogProps) {
  const [answer, setAnswer] = useState("")
  const [challenge, setChallenge] = useState({ a: 0, b: 0, sum: 0 })
  const verifyId = useId()

  // Generate a fresh challenge each time the dialog opens
  useEffect(() => {
    if (open) {
      const a = Math.floor(Math.random() * 20) + 1
      const b = Math.floor(Math.random() * 20) + 1
      setChallenge({ a, b, sum: a + b })
      setAnswer("")
    }
  }, [open])

  const isCorrect = answer.trim() === String(challenge.sum)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--status-destructive-bg)">
              <Trash
                size={20}
                className="text-(--color-destructive)"
                aria-hidden="true"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <Dialog.Title>Delete Member</Dialog.Title>
              <Dialog.Description>
                This action cannot be undone.
              </Dialog.Description>
            </div>
          </div>
          <Dialog.Close />
        </Dialog.Header>

        <Dialog.Body>
          <p className="mb-4 text-sm text-(--text-primary) text-wrap-pretty">
            Are you sure you want to remove <strong>{memberName}</strong> from
            the team? All their access and permissions will be revoked
            immediately.
          </p>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={verifyId}
              className="text-sm font-medium text-(--text-primary)"
            >
              To confirm, solve: {challenge.a}&nbsp;+&nbsp;{challenge.b}
              &nbsp;=&nbsp;?
            </label>
            <input
              id={verifyId}
              name="verification"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter answer…"
              className="w-full min-h-[40px] rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-subtle) transition-[border-color,box-shadow] focus:border-(--color-brand) focus:shadow-[0_0_0_4px_var(--focus-ring)] focus:outline-none"
            />
          </div>
        </Dialog.Body>

        <Dialog.Footer>
          <div className="flex items-center justify-end gap-3">
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
              }}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-[background-color,opacity,transform] touch-action-manipulation",
                "border-none bg-(--color-destructive) text-(--text-on-accent)",
                "hover:opacity-90 active:scale-[0.97]",
                "focus-visible:shadow-[0_0_0_4px_var(--focus-ring-error)] focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              )}
            >
              <Trash size={16} weight="bold" aria-hidden="true" />
              Delete Member
            </button>
          </div>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
