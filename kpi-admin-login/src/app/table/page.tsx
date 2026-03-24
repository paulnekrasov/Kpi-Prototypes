"use client"

import { Table } from "@components/layout/table"
import { Pagination } from "@components/ui/pagination"
import { useState } from "react"

const ROWS = [
  { id: 1, name: "Іваненко Олексій",   role: "Голова",          dept: "Президія",    status: "Активний",  joined: "2023-09-01" },
  { id: 2, name: "Петренко Марія",     role: "Заступник",       dept: "Президія",    status: "Активний",  joined: "2023-09-01" },
  { id: 3, name: "Сидоренко Дмитро",  role: "Відповідальний",  dept: "Медіа",       status: "Активний",  joined: "2024-01-15" },
  { id: 4, name: "Коваленко Анна",     role: "Координатор",     dept: "Події",       status: "Відпустка", joined: "2023-10-03" },
  { id: 5, name: "Мельник Сергій",     role: "Член",            dept: "IT",          status: "Активний",  joined: "2024-02-20" },
  { id: 6, name: "Бондаренко Олена",   role: "Координатор",     dept: "Фінанси",     status: "Активний",  joined: "2023-11-11" },
  { id: 7, name: "Ткаченко Владислав", role: "Член",            dept: "Медіа",       status: "Неактивний",joined: "2023-09-15" },
  { id: 8, name: "Гриценко Юлія",      role: "Відповідальна",   dept: "Події",       status: "Активний",  joined: "2024-03-01" },
]

const STATUS_STYLES: Record<string, string> = {
  "Активний":    "bg-(--color-success)/10 text-(--color-success)",
  "Відпустка":   "bg-(--color-brand)/10 text-(--color-brand)",
  "Неактивний":  "bg-(--color-destructive)/10 text-(--color-destructive)",
}

export default function TableDemo() {
  const [page, setPage] = useState(1)

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-base)",
        zIndex: 50,
        padding: "32px",
        overflow: "auto",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "20px",
          fontWeight: 600,
          marginBottom: "20px",
          color: "var(--text-primary)",
        }}
      >
        Table component demo
      </h1>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>#</Table.Head>
            <Table.Head>Ім&#39;я</Table.Head>
            <Table.Head>Роль</Table.Head>
            <Table.Head>Відділ</Table.Head>
            <Table.Head>Статус</Table.Head>
            <Table.Head>Дата входу</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ROWS.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell className="text-(--text-muted)">{row.id}</Table.Cell>
              <Table.Cell className="font-medium">{row.name}</Table.Cell>
              <Table.Cell className="text-(--text-muted)">{row.role}</Table.Cell>
              <Table.Cell className="text-(--text-muted)">{row.dept}</Table.Cell>
              <Table.Cell>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[row.status]}`}
                >
                  {row.status}
                </span>
              </Table.Cell>
              <Table.Cell className="text-(--text-muted)">{row.joined}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-end mt-4">
        <Pagination currentPage={page} totalPages={12} onPageChange={setPage}>
          <Pagination.Prev />
          <Pagination.Pages />
          <Pagination.Next />
        </Pagination>
      </div>
    </div>
  )
}
