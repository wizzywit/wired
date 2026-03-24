import type { AwarenessUser } from './awarenessTypes'

/** Stable hue per user; matches remote cursor / selection styling. */
export function colorForUserId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const hue = Math.abs(h) % 360
  return `hsl(${hue} 72% 48%)`
}

export function initialsFromAwarenessUser(user: AwarenessUser): string {
  const name = user.displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const first = parts[0]!.charAt(0)
      const last = parts[parts.length - 1]!.charAt(0)
      return (first + last).toUpperCase()
    }
    if (parts.length === 1 && parts[0]!.length >= 2) {
      return parts[0]!.slice(0, 2).toUpperCase()
    }
    if (parts.length === 1 && parts[0]!.length === 1) {
      const e = user.email?.charAt(0) ?? ''
      return (parts[0]! + e).toUpperCase()
    }
  }
  const local = user.email?.split('@')[0]?.trim() ?? ''
  if (local.length >= 2) return local.slice(0, 2).toUpperCase()
  if (local.length === 1) return local.toUpperCase()
  return '?'
}
