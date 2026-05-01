import * as React from 'react'
import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-white/8', className)}
      {...props}
    />
  )
}

export function SkeletonCard({ rows = 2 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface-container-low/72 p-4 space-y-3">
      <Skeleton className="h-5 w-2/5" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === rows - 1 ? 'w-3/5' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={1} />
      ))}
    </div>
  )
}
