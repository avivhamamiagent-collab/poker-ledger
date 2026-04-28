import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'

import { cn } from '../../lib/utils'

export const ToastProvider = ToastPrimitives.Provider
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(function ToastViewport({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed bottom-20 left-0 right-0 z-50 flex max-h-screen w-full flex-col gap-2 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:w-[360px]',
        className,
      )}
      {...props}
    />
  )
})

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(function Toast({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 text-zinc-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:fade-in-80 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
        className,
      )}
      {...props}
    />
  )
})

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(function ToastTitle({ className, ...props }, ref) {
  return <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
})

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(function ToastDescription({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn('text-sm text-zinc-600 dark:text-zinc-400', className)}
      {...props}
    />
  )
})

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(function ToastAction({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        'inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-50',
        className,
      )}
      {...props}
    />
  )
})

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(function ToastClose({ className, ...props }, ref) {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-zinc-500 opacity-0 transition-opacity hover:text-zinc-900 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:text-zinc-400 dark:hover:text-zinc-50',
        className,
      )}
      toast-close=""
      {...props}
    />
  )
})

