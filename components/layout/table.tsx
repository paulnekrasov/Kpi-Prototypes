import React from "react"

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

// ─── Subcomponents ───────────────────────────────────────────────

function TableRoot({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm text-(--text-primary)", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-(--border-subtle)", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-(--border-subtle) bg-(--bg-base) font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-(--border-subtle) transition-colors hover:bg-(--bg-subtle) data-[state=selected]:bg-(--bg-subtle)",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
        data-slot="table-head"
        className={cn(
        "h-10 px-3 text-left align-middle font-medium text-(--text-muted) break-words [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
        data-slot="table-cell"
        className={cn(
        "px-3 py-2 align-middle break-words [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-(--text-muted)", className)}
      {...props}
    />
  )
}

// ─── Compound export (coss UI pattern) ───────────────────────────
//
// Usage:
//   <Table>
//     <Table.Header><Table.Row><Table.Head>Name</Table.Head></Table.Row></Table.Header>
//     <Table.Body><Table.Row><Table.Cell>Value</Table.Cell></Table.Row></Table.Body>
//   </Table>

const Table = Object.assign(TableRoot, {
  Header:  TableHeader,
  Body:    TableBody,
  Footer:  TableFooter,
  Row:     TableRow,
  Head:    TableHead,
  Cell:    TableCell,
  Caption: TableCaption,
})

// Named exports kept for flat import style
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
