"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGINATION } from "@/constants/table";

export interface DataTablePaginationProps {
  page: number; // página atual (1-based)
  perPage: number; // itens por página
  total: number; // total de itens
  selectedCount: number; // itens selecionados no total
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  pageSizeOptions?: number[]; // opções customizadas de tamanho de página
}

export function DataTablePagination({
  page,
  perPage,
  total,
  selectedCount,
  onPageChange,
  onPerPageChange,
  pageSizeOptions,
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  const options = pageSizeOptions ?? PAGINATION.PAGE_SIZE_OPTIONS;

  const handleFirst = () => onPageChange(1);
  const handlePrev = () => onPageChange(Math.max(1, page - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, page + 1));
  const handleLast = () => onPageChange(totalPages);

  return (
    <div className="flex flex-col space-y-2 p-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      {/* Linha superior: seleção e controle de linhas por página no mobile */}
      <div className="flex items-center justify-between sm:justify-start">
        <div className="text-sm">
          {selectedCount} de {total} linha(s) selecionada(s).
        </div>

        {/* Controle de linhas por página - visível apenas no mobile */}
        <div className="flex items-center space-x-2 sm:hidden">
          <span className="text-sm">Linhas por página</span>
          <Select
            value={perPage.toString()}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Linha inferior: navegação de páginas e controle de linhas por página */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        {/* Controle de linhas por página - visível apenas no desktop */}
        <div className="hidden items-center space-x-2 sm:flex">
          <span className="text-sm">Linhas por página</span>
          <Select
            value={perPage.toString()}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Informação da página - visível apenas no desktop */}
        <span className="hidden text-sm sm:block">
          Página {page} de {totalPages}
        </span>

        {/* Botões de navegação */}
        <div className="flex justify-between sm:space-x-2">
          {/* Botões da esquerda */}
          <div className="flex space-x-1 sm:space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleFirst}
              disabled={page <= 1}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrev}
              disabled={page <= 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Informação da página - visível apenas no mobile */}
          <span className="block text-sm sm:hidden">
            Página {page} de {totalPages}
          </span>

          {/* Botões da direita */}
          <div className="flex space-x-1 sm:space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleNext}
              disabled={page >= totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLast}
              disabled={page >= totalPages}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
