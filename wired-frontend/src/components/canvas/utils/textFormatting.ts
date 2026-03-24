export type TextAlignOption = 'left' | 'center' | 'right'

export type KonvaFontStyle =
  | 'normal'
  | 'bold'
  | 'italic'
  | 'bold italic'

export const TEXT_FONT_OPTIONS = [
  { id: 'inter', label: 'Inter', value: 'Inter, sans-serif' },
  { id: 'georgia', label: 'Georgia', value: 'Georgia, serif' },
  { id: 'mono', label: 'Mono', value: 'ui-monospace, monospace' },
  { id: 'system', label: 'System', value: 'system-ui, sans-serif' },
] as const

export function combineFontStyle(
  bold: boolean,
  italic: boolean,
): KonvaFontStyle {
  if (bold && italic) return 'bold italic'
  if (bold) return 'bold'
  if (italic) return 'italic'
  return 'normal'
}

export function parseFontStyle(style: string | undefined): {
  bold: boolean
  italic: boolean
} {
  const s = style ?? 'normal'
  if (s === 'bold italic') return { bold: true, italic: true }
  if (s === 'bold') return { bold: true, italic: false }
  if (s === 'italic') return { bold: false, italic: true }
  return { bold: false, italic: false }
}
