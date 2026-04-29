import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'

export function OnboardingBanner({
  stepLabel,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled,
}: {
  stepLabel: string
  title: string
  body: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  primaryDisabled?: boolean
}) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/5 p-3 text-sm')}> 
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-zinc-400">{stepLabel}</div>
          <div className="font-semibold text-zinc-50">{title}</div>
          <div className="mt-1 text-xs text-zinc-300">{body}</div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button size="sm" onClick={onPrimary} disabled={primaryDisabled}>
            {primaryLabel}
          </Button>
          {secondaryLabel && onSecondary ? (
            <Button size="sm" variant="ghost" onClick={onSecondary} className="text-zinc-300 hover:text-zinc-50">
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
