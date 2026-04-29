import * as React from 'react'

import { cn } from '../../lib/utils'

export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-lg border border-tertiary/15 bg-surface-container-low/80 px-3 py-2 text-sm text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-on-surface-variant/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/45 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
