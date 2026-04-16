'use client'

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background">
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        {[...Array(7)].map((_, i) => (
          <div key={i} className={`h-4 bg-muted rounded animate-pulse ${i === 0 ? 'flex-1' : 'w-20'}`} />
        ))}
      </div>

      {/* Table Rows */}
      {[...Array(5)].map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-b-0"
        >
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
          {[...Array(6)].map((_, colIdx) => (
            <div key={colIdx} className="h-4 w-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  )
}
