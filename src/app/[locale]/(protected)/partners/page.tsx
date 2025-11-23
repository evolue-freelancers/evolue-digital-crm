"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

import { CreateTenantDialog } from "./_components/create-tenant-dialog";
import { CreateUserDialog } from "./_components/create-user-dialog";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "INACTIVE";
  createdAt: Date;
  _count: {
    members: number;
    domains: number;
  };
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  TRIAL: "Trial",
  SUSPENDED: "Suspenso",
  INACTIVE: "Inativo",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  TRIAL: "secondary",
  SUSPENDED: "destructive",
  INACTIVE: "outline",
};

export default function PartnersPage() {
  const t = useTranslations("partners");
  const [searchQuery, setSearchQuery] = useState("");
  const [createTenantOpen, setCreateTenantOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.platform.tenants.list.useQuery();

  const columns: ColumnDef<Tenant>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      enableSorting: true,
      meta: { type: "string" as const },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      enableSorting: true,
      meta: { type: "string" as const },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={statusVariants[status] || "outline"}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
      meta: { type: "string" as const },
    },
    {
      accessorKey: "_count.members",
      header: "Membros",
      enableSorting: false,
      cell: ({ row }) => {
        const count = row.original._count.members;
        return <span>{count}</span>;
      },
      meta: { type: "number" as const },
    },
    {
      accessorKey: "_count.domains",
      header: "Domínios",
      enableSorting: false,
      cell: ({ row }) => {
        const count = row.original._count.domains;
        return <span>{count}</span>;
      },
      meta: { type: "number" as const },
    },
    {
      id: "actions",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedTenantId(row.original.id);
                setCreateUserOpen(true);
              }}
            >
              Adicionar Usuário
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: setSearchQuery,
  });

  const handleResetFilters = () => {
    setSearchQuery("");
  };

  const isAnyFilterActive = !!searchQuery;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Button onClick={() => setCreateTenantOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("createTenant")}
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <DataTableToolbar
          searchProps={{
            searchQuery,
            onSearch: setSearchQuery,
            searchPlaceholder: t("searchPlaceholder"),
          }}
          isAnyFilterActive={isAnyFilterActive}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            {t("loading")}
          </div>
        ) : (
          <>
            <DataTable table={table} enableBorder />
            <DataTablePagination
              page={table.getState().pagination.pageIndex + 1}
              perPage={table.getState().pagination.pageSize}
              total={table.getFilteredRowModel().rows.length}
              selectedCount={table.getSelectedRowModel().rows.length}
              onPageChange={(page) => table.setPageIndex(page - 1)}
              onPerPageChange={(perPage) => table.setPageSize(perPage)}
            />
          </>
        )}
      </div>

      <CreateTenantDialog
        open={createTenantOpen}
        onOpenChange={setCreateTenantOpen}
        onSuccess={() => {
          refetch();
          setCreateTenantOpen(false);
        }}
      />

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        tenantId={selectedTenantId}
        onSuccess={() => {
          refetch();
          setCreateUserOpen(false);
          setSelectedTenantId(null);
        }}
      />
    </div>
  );
}
