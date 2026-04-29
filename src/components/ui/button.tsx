import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-tertiary/25 bg-[linear-gradient(180deg,#e9c349,#b88c17)] text-on-tertiary shadow-[0_12px_30px_rgba(233,195,73,0.16)] hover:brightness-110',
        secondary:
          'border border-tertiary/18 bg-surface-container-high/80 text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-tertiary/35 hover:bg-surface-variant',
        outline:
          'border border-tertiary/25 bg-transparent text-on-surface hover:bg-tertiary/10 hover:text-tertiary',
        ghost: 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
        destructive:
          'border border-red-300/20 bg-red-500/16 text-red-100 hover:bg-red-500/24',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
