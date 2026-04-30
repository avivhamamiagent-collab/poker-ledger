// Centralized error formatting for UI toasts.

type MaybeSupabaseError = {
  message?: unknown
  details?: unknown
  hint?: unknown
  code?: unknown
  status?: unknown
}

export function isNotAuthenticatedError(err: unknown): boolean {
  if (!err) return false
  if (err instanceof Error && err.message === 'Not authenticated') return true
  const anyErr = err as MaybeSupabaseError
  if (anyErr?.message === 'Not authenticated') return true
  // Supabase AuthApiError sometimes exposes status=401.
  if (anyErr?.status === 401) return true
  return false
}

function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

export function formatError(err: unknown): string {
  if (!err) return 'שגיאה לא ידועה'
  if (err instanceof Error) {
    // Supabase errors are often Error-like with extra fields.
    const anyErr = err as any as MaybeSupabaseError
    const parts = [err.message]
    const details = toStr(anyErr.details)
    const hint = toStr(anyErr.hint)
    const code = toStr(anyErr.code)
    if (details) parts.push(details)
    if (hint) parts.push(hint)
    if (code) parts.push(`code: ${code}`)
    return parts.filter(Boolean).join(' · ')
  }

  const anyErr = err as MaybeSupabaseError
  const msg = toStr(anyErr?.message) || toStr(err)
  if (msg) return msg
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

