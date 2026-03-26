"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "@components/utils/cn";

type DialogSize = "sm" | "md" | "lg";

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

// ─── Root ──────────────────────────────────────────────────────────────────────

function DialogRoot({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

// ─── Content (Portal + Overlay + panel) ───────────────────────────────────────

function DialogContent({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: DialogSize | `max-w-${string}`;
}) {
  const resolvedSizeClass =
    typeof size === "string" && size.startsWith("max-w-")
      ? size
      : sizeClasses[(size as DialogSize) ?? "md"];

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-50 bg-(--text-primary)/20 backdrop-blur-sm"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-h-[calc(100vh-3rem)] -translate-x-1/2 -translate-y-1/2",
          "mx-auto flex flex-col overflow-hidden rounded-[28px]",
          "border border-(--border-subtle-plus) bg-(--bg-base) shadow-[var(--shadow-subtle-active)]",
          resolvedSizeClass,
          className,
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex items-start justify-between gap-4 border-b border-(--border-subtle-plus) px-6 py-5 sm:px-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Title ────────────────────────────────────────────────────────────────────

function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg font-semibold tracking-[-0.03em] text-(--text-primary)",
        className,
      )}
    >
      {children}
    </DialogPrimitive.Title>
  );
}

// ─── Description ──────────────────────────────────────────────────────────────

function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm leading-6 text-(--text-muted)", className)}
    >
      {children}
    </DialogPrimitive.Description>
  );
}

// ─── Close ────────────────────────────────────────────────────────────────────

function DialogClose({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      aria-label="Close dialog"
      className={cn("icon-button icon-button-secondary", className)}
    >
      <X size={16} aria-hidden="true" />
    </DialogPrimitive.Close>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

function DialogBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("min-h-0 overflow-y-auto px-6 py-5 sm:px-7", className)}
    >
      {children}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "border-t border-(--border-subtle-plus) px-6 py-5 sm:px-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Compound export ──────────────────────────────────────────────────────────

export const Dialog = Object.assign(DialogRoot, {
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Body: DialogBody,
  Footer: DialogFooter,
});
