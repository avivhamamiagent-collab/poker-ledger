import * as React from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e1117] p-6 shadow-2xl">
        <h2
          id="confirm-dialog-title"
          className="text-base font-semibold text-zinc-50"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm leading-6 text-zinc-400">{description}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={
              destructive
                ? 'border-red-400/20 bg-red-500/15 text-red-200 hover:bg-red-500/25 hover:text-red-100'
                : ''
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function useConfirm() {
  const [state, setState] = React.useState<{
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    destructive?: boolean
    resolve: ((confirmed: boolean) => void) | null
  }>({ open: false, title: '', resolve: null })

  const confirm = React.useCallback(
    (opts: { title: string; description?: string; confirmLabel?: string; destructive?: boolean }) =>
      new Promise<boolean>((resolve) => {
        setState({ open: true, resolve, ...opts })
      }),
    [],
  )

  const handleConfirm = () => {
    state.resolve?.(true)
    setState((s) => ({ ...s, open: false, resolve: null }))
  }

  const handleCancel = () => {
    state.resolve?.(false)
    setState((s) => ({ ...s, open: false, resolve: null }))
  }

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      destructive={state.destructive}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, dialog }
}
