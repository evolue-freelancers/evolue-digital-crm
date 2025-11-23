import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DataTableBoxFilter } from "./data-table-box-filter";
import { DataTableDateRangeFilter } from "./data-table-date-range-filter";
import { DataTableResetFilter } from "./data-table-reset-filter";
import { DataTableSearch } from "./data-table-search";

interface DataTableToolbarProps {
  searchProps?: React.ComponentProps<typeof DataTableSearch>;
  boxFilterProps?: Array<React.ComponentProps<typeof DataTableBoxFilter>>;
  dateRangeFilterProps?: React.ComponentProps<typeof DataTableDateRangeFilter>;
  children?: ReactNode;
  className?: string;
  isAnyFilterActive?: boolean | null;
  onReset?: () => void | null;
}

export function DataTableToolbar({
  searchProps,
  boxFilterProps,
  dateRangeFilterProps,
  children,
  className,
  isAnyFilterActive,
  onReset,
}: DataTableToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-2 lg:flex-row", className)}>
      <div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
        {searchProps && (
          <div className="w-full lg:w-auto lg:flex-1">
            <DataTableSearch {...searchProps} />
          </div>
        )}
        <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
          {boxFilterProps && (
            <>
              {boxFilterProps.map((boxFilterProps, index) => (
                <DataTableBoxFilter key={index} {...boxFilterProps} />
              ))}
            </>
          )}
          {dateRangeFilterProps && (
            <DataTableDateRangeFilter {...dateRangeFilterProps} />
          )}
        </div>
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={onReset}
        />
      </div>
      {children && (
        <div className="flex flex-1 items-center justify-between gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
