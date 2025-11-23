"use client";

import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import {
  ArrowDown01Icon,
  ArrowDown10Icon,
  ArrowDownAZIcon,
  ArrowDownZAIcon,
  ArrowUp01Icon,
  ArrowUpAZIcon,
} from "lucide-react";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from "@/lib/utils";

export type DataTableProps<T> = {
  table: ReactTable<T>;
  enableBorder?: boolean;
};

type SortState = false | "asc" | "desc";
type DataType = "number" | "string";

function renderSortIcon(sorted: SortState, type: DataType) {
  if (sorted === "asc") {
    return type === "number" ? (
      <ArrowUp01Icon className="h-4 w-4" />
    ) : (
      <ArrowUpAZIcon className="h-4 w-4" />
    );
  } else if (sorted === "desc") {
    return type === "number" ? (
      <ArrowDown10Icon className="h-4 w-4" />
    ) : (
      <ArrowDownZAIcon className="h-4 w-4" />
    );
  } else {
    return type === "number" ? (
      <ArrowDown01Icon className="h-4 w-4 opacity-50" />
    ) : (
      <ArrowDownAZIcon className="h-4 w-4 opacity-50" />
    );
  }
}

export function DataTable<T>({
  table,
  enableBorder = false,
}: DataTableProps<T>) {
  // const isMobile = useIsMobile()

  // // Se estiver em mobile, renderiza o grid
  // if (isMobile) {
  //   return <DataTableGrid table={table} />
  // }

  // Se não estiver em mobile, renderiza a tabela
  return (
    <div className={cn("rounded-md", enableBorder && "border")}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-14">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();

                const type =
                  (
                    header.column.columnDef.meta as {
                      type: DataType;
                    }
                  )?.type || "string";

                return (
                  <TableHead
                    key={header.id}
                    className={cn(canSort && "cursor-pointer select-none")}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {canSort && renderSortIcon(sorted, type)}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-14"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                Sem resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
