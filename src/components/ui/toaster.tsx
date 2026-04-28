import { Toast, ToastAction, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} open onOpenChange={(open) => !open && dismiss(t.id)}>
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          {t.actionLabel && t.onAction && (
            <ToastAction
              altText={t.actionLabel}
              onClick={() => {
                t.onAction?.()
                dismiss(t.id)
              }}
            >
              {t.actionLabel}
            </ToastAction>
          )}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

