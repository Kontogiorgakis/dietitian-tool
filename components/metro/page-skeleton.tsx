import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** The shape of a SectionCard while its data loads. */
export const CardSkeleton = ({ rows = 3, className }: { rows?: number; className?: string }) => (
  <div className={cn("flex flex-col gap-4 rounded-lg border border-hairline bg-surface-raised p-5", className)}>
    <div className="flex items-center gap-2.5">
      <Skeleton className="size-8 rounded-md bg-surface-field" />
      <Skeleton className="h-5 w-40 bg-surface-field" />
    </div>
    <Skeleton className="h-4 w-3/4 bg-surface-field" />
    <div className="flex flex-col gap-3 pt-1">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full bg-surface-field" />
      ))}
    </div>
  </div>
);

interface PageSkeletonProps {
  /** A wide title, as on a client screen, or a short one, as on a list. */
  title?: "wide" | "short";
  /** Cards per row at 1024 and above. */
  columns?: 1 | 2;
  cards?: number;
}

/** A whole screen while it loads: header, then cards in the page's grid. */
export const PageSkeleton = ({ title = "short", columns = 2, cards = 4 }: PageSkeletonProps) => (
  <div className="flex min-h-svh flex-col" aria-busy="true" aria-live="polite">
    <div className="flex flex-col gap-3 px-gutter pt-[18px] pb-4 lg:px-10 lg:pt-8 lg:pb-6">
      <Skeleton className={cn("h-8 bg-surface-field", title === "wide" ? "w-72" : "w-40")} />
      <Skeleton className="h-4 w-56 bg-surface-field" />
    </div>
    <div className={cn("grid gap-4 px-gutter pb-6 lg:gap-6 lg:px-10 lg:pb-10", columns === 2 && "lg:grid-cols-2")}>
      {Array.from({ length: cards }, (_, i) => (
        <CardSkeleton key={i} rows={i % 2 === 0 ? 3 : 2} />
      ))}
    </div>
  </div>
);
