export function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((section) => (
        <div key={section} className="space-y-4">
          {/* Date header skeleton */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-64 skeleton-pulse" />
            <div className="h-6 w-20 skeleton-pulse rounded-full" />
          </div>
          
          {/* Card skeletons */}
          {[1, 2].map((card) => (
            <div
              key={card}
              className="bg-card rounded-xl p-5 border-l-[6px] border-l-muted"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-6 w-24 skeleton-pulse rounded" />
                <div className="h-5 w-28 skeleton-pulse" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {[1, 2, 3, 4].map((field) => (
                  <div key={field}>
                    <div className="h-3 w-16 skeleton-pulse mb-2" />
                    <div className="h-5 w-40 skeleton-pulse" />
                  </div>
                ))}
              </div>
              
              <div className="h-24 skeleton-pulse rounded-lg mb-5" />
              
              <div className="flex justify-end">
                <div className="h-10 w-44 skeleton-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
