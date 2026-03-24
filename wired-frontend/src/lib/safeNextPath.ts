/** Prevent open redirects: only same-app relative paths. */
export function safeNextPath(raw: string | null): string {
  if (!raw) return '/dashboard'
  const t = raw.trim()
  if (!t.startsWith('/') || t.startsWith('//') || t.includes('://')) {
    return '/dashboard'
  }
  return t
}
