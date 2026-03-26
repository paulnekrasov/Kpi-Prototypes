"use client";

import * as React from "react";
import { X } from "@phosphor-icons/react";
import { IconButton } from "@components/ui/IconButton";
import { cn } from "@components/utils/cn";

type DialogSize = "sm" | "md" | "lg";

interface DialogBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  size?: DialogSize;
}

interface DialogMonolithicProps extends DialogBaseProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

interface DialogContextValue {
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  defaultSize: DialogSize;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error("Dialog compound components must be used inside <Dialog>.");
  }
  return ctx;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function DialogRoot({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  initialFocusRef,
  size = "md",
}: DialogMonolithicProps) {
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

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
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
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
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

  const isMonolithic = typeof title === "string" && title.length > 0;

  if (isMonolithic) {
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
                <p id={descriptionId} className="text-sm leading-6 text-(--text-muted)">
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

  return (
    <DialogContext.Provider
      value={{ onOpenChange, titleId, descriptionId, defaultSize: size }}
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-(--text-primary)/20 px-4 py-6 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      >
        <div ref={dialogRef} className="w-full" onClick={(event) => event.stopPropagation()}>
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

function DialogContent({
  children,
  className,
  size,
}: {
  children: React.ReactNode;
  className?: string;
  size?: DialogSize | `max-w-${string}`;
}) {
  const { titleId, descriptionId, defaultSize } = useDialogContext();
  const resolvedSizeClass =
    size && size.startsWith("max-w-") ? size : sizeClasses[(size as DialogSize) ?? defaultSize];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        "mx-auto flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-[28px] border border-(--border-subtle-plus) bg-(--bg-base) shadow-[var(--shadow-subtle-active)]",
        resolvedSizeClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-(--border-subtle-plus) px-6 py-5 sm:px-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { titleId } = useDialogContext();
  return (
    <h2
      id={titleId}
      className={cn("text-lg font-semibold tracking-[-0.03em] text-(--text-primary)", className)}
    >
      {children}
    </h2>
  );
}

function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { descriptionId } = useDialogContext();
  return (
    <p id={descriptionId} className={cn("text-sm leading-6 text-(--text-muted)", className)}>
      {children}
    </p>
  );
}

function DialogClose({ className }: { className?: string }) {
  const { onOpenChange } = useDialogContext();
  return (
    <IconButton
      aria-label="Close dialog"
      icon={X}
      variant="secondary"
      className={className}
      onClick={() => onOpenChange(false)}
    />
  );
}

function DialogBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 overflow-y-auto px-6 py-5 sm:px-7", className)}>
      {children}
    </div>
  );
}

function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-t border-(--border-subtle-plus) px-6 py-5 sm:px-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Body: DialogBody,
  Footer: DialogFooter,
});
