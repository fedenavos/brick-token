"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps<TData> {
  columns: Array<{
    header: string
    accessorKey?: string
    id?: string
    cell?: ({ row }: { row: { original: TData } }) => React.ReactNode
  }>
  data: TData[]
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey || column.id}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.accessorKey || column.id}>
                    {column.cell
                      ? column.cell({ row: { original: row } })
                      : column.accessorKey
                        ? String((row as any)[column.accessorKey])
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
