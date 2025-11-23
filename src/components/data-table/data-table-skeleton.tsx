import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount = 7,
  rowCount = 5,
}: DataTableSkeletonProps) {
  return (
    <div className="bg-background text-foreground">
      <div>
        {/* Tabela de Skeleton */}
        <div className="relative">
          <div className="border-border overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="border-border border-b hover:bg-transparent">
                  {Array.from({ length: columnCount }).map((_, index) => (
                    <TableHead
                      key={index}
                      className="px-2 py-3 whitespace-nowrap first:pl-4 last:pr-4"
                    >
                      <Skeleton className="bg-muted h-4 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-border border-b">
                    {Array.from({ length: columnCount }).map((_, colIndex) => {
                      const isFirstColumn = colIndex === 0;
                      const isLastColumn = colIndex === columnCount - 1;
                      const isMiddleColumn = !isFirstColumn && !isLastColumn;

                      const skeletonClass = cn(
                        "h-4 bg-muted",
                        isFirstColumn && "w-32",
                        isLastColumn && "w-16",
                        isMiddleColumn && "w-24"
                      );

                      return (
                        <TableCell
                          key={colIndex}
                          className="px-2 py-3 first:pl-4 last:pr-4"
                        >
                          <Skeleton className={skeletonClass} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer Skeleton */}
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="bg-muted h-4 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="bg-muted h-8 w-24" />
              <Skeleton className="bg-muted h-8 w-20" />
              <Skeleton className="bg-muted h-8 w-8" />
              <Skeleton className="bg-muted h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
