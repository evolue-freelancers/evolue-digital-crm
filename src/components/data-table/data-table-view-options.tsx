"use client";

import type { Table } from "@tanstack/react-table";
import { ColumnsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  // Verifica se existem colunas que podem ser ocultadas
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide() && column.id !== "actions");

  // Se não há colunas para ocultar, não renderiza o componente
  if (hideableColumns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-border text-foreground hover:bg-muted/70 ml-auto flex h-9 border text-xs sm:text-sm"
        >
          <ColumnsIcon className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border bg-popover text-foreground w-[180px] border"
      >
        <DropdownMenuLabel className="text-muted-foreground">
          Mostrar colunas
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="text-foreground data-[state=checked]:bg-muted/50 capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id.replace(/([A-Z])/g, " $1").trim()}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
