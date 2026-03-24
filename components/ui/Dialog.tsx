"use client";

import * as React from "react";
import { X } from "@phosphor-icons/react";
import { IconButton } from "@components/ui/IconButton";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<DialogProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  initialFocusRef,
  size = "md",
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusDialog = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      focusableElements?.[0]?.focus();
    };

    const animationFrame = window.requestAnimationFrame(focusDialog);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElement?.focus();
    };
  }, [initialFocusRef, onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--text-primary)/20 px-4 py-6 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-[28px] border border-(--border-subtle-plus) bg-(--bg-base) shadow-[var(--shadow-subtle-active)]",
          sizeClasses[size],
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--border-subtle-plus) px-6 py-5 sm:px-7">
          <div className="flex min-w-0 flex-col gap-1">
            <h2
              id={titleId}
              className="text-balance text-lg font-semibold tracking-[-0.03em] text-(--text-primary)"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="text-sm leading-6 text-(--text-muted)"
              >
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            aria-label="Close dialog"
            icon={X}
            variant="secondary"
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className="min-h-0 overflow-y-auto px-6 py-5 sm:px-7">{children}</div>

        {footer ? (
          <div className="border-t border-(--border-subtle-plus) px-6 py-5 sm:px-7">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
