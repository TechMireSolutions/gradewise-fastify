import { cn } from "@/lib/cn.js";

export function StatCardSkeleton({ className }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card/60 p-4 sm:p-5 backdrop-blur-sm animate-pulse", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-12 rounded-lg bg-muted-foreground/20" />
          <div className="h-3 w-24 rounded bg-muted-foreground/15" />
        </div>
        <div className="h-11 w-11 rounded-xl bg-muted-foreground/20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, className }) {
  const rowArray = Array.from({ length: rows }, (_, i) => i);
  return (
    <div className={cn("divide-y divide-border animate-pulse p-2", className)}>
      {rowArray.map((i) => (
        <div key={i} className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted-foreground/20 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-40 sm:w-56 rounded bg-muted-foreground/20" />
              <div className="h-3 w-24 rounded bg-muted-foreground/15" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-full bg-muted-foreground/20" />
          <div className="hidden sm:flex gap-2">
            <div className="h-8 w-14 rounded-lg bg-muted-foreground/20" />
            <div className="h-8 w-14 rounded-lg bg-muted-foreground/20" />
            <div className="h-8 w-14 rounded-lg bg-muted-foreground/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardListSkeleton({ count = 3, className }) {
  const cardArray = Array.from({ length: count }, (_, i) => i);
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      {cardArray.map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card/60 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 rounded bg-muted-foreground/20" />
            <div className="h-6 w-16 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="h-3 w-32 rounded bg-muted-foreground/15" />
          <div className="pt-2 border-t border-border/60 flex justify-end">
            <div className="h-9 w-24 rounded-lg bg-muted-foreground/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
