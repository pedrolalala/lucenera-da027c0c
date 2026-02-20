export function FinalizadasListSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 h-14 border-b border-border last:border-b-0">
          <div className="h-6 w-20 skeleton-pulse rounded-full" />
          <div className="h-4 flex-1 max-w-[200px] skeleton-pulse" />
          <div className="h-4 w-20 skeleton-pulse hidden sm:block" />
          <div className="h-4 w-24 skeleton-pulse hidden md:block" />
          <div className="h-8 w-20 skeleton-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}
