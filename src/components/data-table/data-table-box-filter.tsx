"use client";

import { CheckIcon, PlusCircle } from "lucide-react";
import React, { useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableBoxFilterProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  width?: number | string;
  className?: string;
}

export function DataTableBoxFilter({
  title,
  options,
  selected,
  onChange,
  placeholder = `Buscar ${title}...`,
  width = 240,
  className,
}: DataTableBoxFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = useCallback(
    (value: string) => {
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];

      onChange(newSelected);
    },
    [selected, onChange]
  );

  const resetFilter = () => onChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "bg-background text-foreground hover:bg-muted/50 hover:text-foreground w-full justify-between border-dashed sm:w-auto sm:justify-start transition-colors [&:hover]:text-foreground",
            className
          )}
        >
          <div className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            {title}
          </div>
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selected.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selected.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selected.length} selecionados
                  </Badge>
                ) : (
                  selected.map((value) => (
                    <Badge
                      variant="secondary"
                      key={value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {options.find((option) => option.value === value)
                        ?.label || value}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        style={{ width: typeof width === "number" ? `${width}px` : width }}
        className="p-0"
        align={isSmallScreen ? "start" : "end"}
        alignOffset={-4}
        sideOffset={4}
      >
        <Command>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={placeholder}
            autoFocus
          />
          <CommandList>
            <CommandEmpty className="text-muted-foreground">
              Nenhum resultado encontrado.
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer group hover:bg-accent/50"
                  aria-checked={selected.includes(option.value)}
                  role="option"
                  data-value={option.value}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
                      selected.includes(option.value)
                        ? "border-primary bg-primary"
                        : "border-input opacity-50 group-hover:border-primary/30 group-hover:opacity-70"
                    )}
                  >
                    <CheckIcon
                      className={cn(
                        "h-4 w-4",
                        selected.includes(option.value)
                          ? "visible text-primary-foreground"
                          : "invisible"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  {option.icon && (
                    <option.icon
                      className="text-muted-foreground mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      selected.includes(option.value)
                        ? "text-primary-foreground"
                        : "text-foreground group-hover:text-accent-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={resetFilter}
                    className="text-destructive justify-center text-center"
                  >
                    Limpar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
