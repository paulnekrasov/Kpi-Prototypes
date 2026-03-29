"use client";

import * as React from "react";
import { CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react";
import { cn } from "@components/utils/cn";

// ─── Context ──────────────────────────────────────────────────────────────────

type PaginationCtx = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const PaginationContext = React.createContext<PaginationCtx | null>(null);

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext);
  if (!ctx) throw new Error("Pagination subcomponent used outside <Pagination>");
  return ctx;
}

// ─── Shared item style ────────────────────────────────────────────────────────

const itemBase =
  "inline-flex items-center justify-center min-h-8 rounded-md text-sm font-normal tracking-[-0.02em] select-none " +
  "transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] " +
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] " +
  "disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

// ─── Root ─────────────────────────────────────────────────────────────────────

type PaginationRootProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
  className?: string;
};

function PaginationRoot({
  currentPage,
  totalPages,
  onPageChange,
  children,
  className,
}: PaginationRootProps) {
  return (
    <PaginationContext.Provider value={{ currentPage, totalPages, onPageChange }}>
      <nav
        data-slot="pagination"
        aria-label="Pagination"
        className={cn("flex items-center gap-1.5", className)}
      >
        {children}
      </nav>
    </PaginationContext.Provider>
  );
}

// ─── Prev ─────────────────────────────────────────────────────────────────────

function PaginationPrev({ className }: { className?: string }) {
  const { currentPage, onPageChange } = usePaginationContext();
  const disabled = currentPage <= 1;

  return (
    <button
      type="button"
      data-slot="pagination-prev"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={disabled}
      aria-label="Previous page"
      className={cn(
        itemBase,
        "gap-1 px-3 text-(--text-muted) hover:text-(--text-primary)",
        className,
      )}
    >
      <CaretLeft weight="bold" className="size-4" />
      <span>Previous</span>
    </button>
  );
}

// ─── Next ─────────────────────────────────────────────────────────────────────

function PaginationNext({ className }: { className?: string }) {
  const { currentPage, totalPages, onPageChange } = usePaginationContext();
  const disabled = currentPage >= totalPages;

  return (
    <button
      type="button"
      data-slot="pagination-next"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={disabled}
      aria-label="Next page"
      className={cn(
        itemBase,
        "gap-1 px-3 text-(--text-primary)",
        className,
      )}
    >
      <span>Next</span>
      <CaretRight weight="bold" className="size-4" />
    </button>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

function PaginationPages({ className }: { className?: string }) {
  const { currentPage, totalPages, onPageChange } = usePaginationContext();
  const pages = getPageRange(currentPage, totalPages);

  return (
    <>
      {pages.map((page, i) =>
        page === "…" ? (
          <span
            key={`ellipsis-${i}`}
            data-slot="pagination-ellipsis"
            aria-hidden
            className="inline-flex size-8 items-center justify-center text-(--text-muted)"
          >
            <DotsThree weight="bold" className="size-4" />
          </span>
        ) : (
          <button
            key={page}
            type="button"
            data-slot="pagination-page"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              itemBase,
              page === currentPage
                ? "h-8 min-w-8 border border-(--border-subtle) bg-(--bg-base) px-2.5 text-(--text-primary)"
                : "h-8 min-w-8 px-2.5 text-(--text-primary) hover:text-(--text-accent)",
              className,
            )}
          >
            {page}
          </button>
        ),
      )}
    </>
  );
}

// ─── Compound export ──────────────────────────────────────────────────────────
//
// Usage:
//   <Pagination currentPage={page} totalPages={20} onPageChange={setPage}>
//     <Pagination.Prev />
//     <Pagination.Pages />
//     <Pagination.Next />
//   </Pagination>

const Pagination = Object.assign(PaginationRoot, {
  Prev: PaginationPrev,
  Next: PaginationNext,
  Pages: PaginationPages,
});

export { Pagination, PaginationPrev, PaginationNext, PaginationPages };
