"use client"

import React from "react"
import { CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react"
import { cn } from "@components/utils/cn"

// ─── Context ──────────────────────────────────────────────────────

type PaginationCtx = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const PaginationContext = React.createContext<PaginationCtx | null>(null)

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext)
  if (!ctx) throw new Error("Pagination subcomponent used outside <Pagination>")
  return ctx
}

// ─── Shared button style ──────────────────────────────────────────

const itemBase =
  "inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-md text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] disabled:opacity-40 disabled:pointer-events-none"

// ─── Subcomponents ────────────────────────────────────────────────

type PaginationRootProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  children: React.ReactNode
  className?: string
}

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
        className={cn("flex items-center gap-1", className)}
      >
        {children}
      </nav>
    </PaginationContext.Provider>
  )
}

function PaginationPrev({ className }: { className?: string }) {
  const { currentPage, onPageChange } = usePaginationContext()
  const disabled = currentPage <= 1

  return (
    <button
      type="button"
      data-slot="pagination-prev"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={disabled}
      aria-label="Previous page"
      className={cn(
        itemBase,
        "border border-(--border-subtle) text-(--text-primary) hover:bg-(--bg-subtle)",
        className
      )}
    >
      <CaretLeft weight="bold" className="w-4 h-4" />
    </button>
  )
}

function PaginationNext({ className }: { className?: string }) {
  const { currentPage, totalPages, onPageChange } = usePaginationContext()
  const disabled = currentPage >= totalPages

  return (
    <button
      type="button"
      data-slot="pagination-next"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={disabled}
      aria-label="Next page"
      className={cn(
        itemBase,
        "border border-(--border-subtle) text-(--text-primary) hover:bg-(--bg-subtle)",
        className
      )}
    >
      <CaretRight weight="bold" className="w-4 h-4" />
    </button>
  )
}

// Builds the page number sequence with ellipsis
function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "…")[] = [1]

  if (current > 3) pages.push("…")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("…")

  pages.push(total)
  return pages
}

function PaginationPages({ className }: { className?: string }) {
  const { currentPage, totalPages, onPageChange } = usePaginationContext()
  const pages = getPageRange(currentPage, totalPages)

  return (
    <>
      {pages.map((page, i) =>
        page === "…" ? (
          <span
            key={`ellipsis-${i}`}
            data-slot="pagination-ellipsis"
            aria-hidden
            className="inline-flex items-center justify-center h-8 w-8 text-(--text-muted)"
          >
            <DotsThree weight="bold" className="w-4 h-4" />
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
                ? "bg-(--color-brand) text-(--text-on-accent)"
                : "text-(--text-primary) hover:bg-(--bg-subtle) border border-(--border-subtle)",
              className
            )}
          >
            {page}
          </button>
        )
      )}
    </>
  )
}

// ─── Compound export (coss UI pattern) ───────────────────────────
//
// Usage:
//   const [page, setPage] = useState(1)
//
//   <Pagination currentPage={page} totalPages={20} onPageChange={setPage}>
//     <Pagination.Prev />
//     <Pagination.Pages />
//     <Pagination.Next />
//   </Pagination>

const Pagination = Object.assign(PaginationRoot, {
  Prev:  PaginationPrev,
  Next:  PaginationNext,
  Pages: PaginationPages,
})

export {
  Pagination,
  PaginationPrev,
  PaginationNext,
  PaginationPages,
}
