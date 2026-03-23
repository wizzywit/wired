import type { StrokeDashPreset } from '../../context/canvasTypes'

/** Maps preset + stroke width to Konva `dash` array (undefined = solid). */
export function dashToKonva(
  preset: StrokeDashPreset | undefined,
  strokeWidth: number,
): number[] | undefined {
  if (preset == null || preset === 'solid') return undefined
  const s = Math.max(1, strokeWidth)
  switch (preset) {
    case 'dashed':
      return [6 * s, 4 * s]
    case 'dotted':
      return [1, 3 * s]
    case 'dashDot':
      return [6 * s, 3 * s, 1, 3 * s]
    default:
      return undefined
  }
}
