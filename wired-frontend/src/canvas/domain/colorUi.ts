/** Normalize any CSS color to #rrggbb for `<input type="color">`. */
export function toHex6(css: string, fallback = '#000000'): string {
  const t = css.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]
    const g = t[2]
    const b = t[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  const m = t.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  )
  if (m) {
    const r = Math.round(Number(m[1]))
    const g = Math.round(Number(m[2]))
    const b = Math.round(Number(m[3]))
    if ([r, g, b].some((n) => !Number.isFinite(n))) return fallback
    const hex = (n: number) =>
      Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')
    return `#${hex(r)}${hex(g)}${hex(b)}`
  }
  return fallback
}

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.min(1, Math.max(0, n))
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = toHex6(hex).slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const a = clamp01(alpha)
  return `rgba(${r},${g},${b},${a})`
}

/**
 * Konva: disable fill entirely when transparent — some builds still tint the interior
 * if only `fillOpacity` is 0.
 */
export function resolveKonvaFill(
  fill: string | undefined,
  fillOpacity: number | undefined,
): { fill: string; fillOpacity: number; fillEnabled: boolean } {
  const fo = fillOpacity ?? 1
  if (fo <= 0) {
    return { fill: '#000000', fillOpacity: 1, fillEnabled: false }
  }
  return {
    fill: fill ?? 'transparent',
    fillOpacity: fo,
    fillEnabled: true,
  }
}
