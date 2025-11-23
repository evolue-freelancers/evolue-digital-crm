"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type DataTableResetFilterProps = {
  isFilterActive?: boolean | null;
  onReset?: () => void | null;
};

export function DataTableResetFilter({
  isFilterActive,
  onReset,
}: DataTableResetFilterProps) {
  if (!isFilterActive) return null;

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={onReset}
      className="border-border text-foreground hover:bg-muted/70"
    >
      <XIcon className="h-4 w-4" />
    </Button>
  );
}
