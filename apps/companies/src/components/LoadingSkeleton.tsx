export function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="card-default p-6 animate-pulse">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mr-4"></div>
              <div className="flex-1">
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>

          {/* Company Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-slate-200 rounded mr-3"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-slate-200 rounded mr-3"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-slate-200 rounded mr-3"></div>
              <div className="h-4 bg-slate-200 rounded w-28"></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-slate-200 rounded-xl"></div>
            <div className="flex-1 h-12 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
