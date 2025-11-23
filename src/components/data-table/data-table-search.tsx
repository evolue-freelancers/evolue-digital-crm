"use client";

import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DataTableSearchProps {
  searchQuery?: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function DataTableSearch({
  searchQuery = "",
  onSearch,
  searchPlaceholder = "Buscar...",
  className,
}: DataTableSearchProps) {
  const isMobile = useIsMobile();

  return (
    <Input
      type="search"
      value={searchQuery}
      onChange={(e) => onSearch(e.target.value)}
      placeholder={searchPlaceholder}
      className={cn(isMobile ? "w-full" : "max-w-[540px]", className)}
    />
  );
}
