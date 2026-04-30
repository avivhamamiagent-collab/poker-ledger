export function id(_prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const fallback = `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
  return `${fallback.slice(0, 8)}-${fallback.slice(8, 12)}-${fallback.slice(12, 16)}-${fallback.slice(16, 20)}-${fallback.slice(20, 32)}`
}

export function todayISO(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
