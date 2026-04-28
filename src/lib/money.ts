export function ils(n: number): string {
  const rounded = Math.round(n)
  return `₪${rounded.toLocaleString('he-IL')}`
}

