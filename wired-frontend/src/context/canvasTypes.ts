export type CanvasTool =
  | 'select'
  | 'pen'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'

export type DrawShape =
  | {
      id: string
      kind: 'path'
      points: number[]
      stroke: string
      strokeWidth: number
    }
  | {
      id: string
      kind: 'rect'
      x: number
      y: number
      width: number
      height: number
      stroke: string
      strokeWidth: number
      fill?: string
    }
  | {
      id: string
      kind: 'ellipse'
      cx: number
      cy: number
      rx: number
      ry: number
      stroke: string
      strokeWidth: number
      fill?: string
    }
  | {
      id: string
      kind: 'line'
      x1: number
      y1: number
      x2: number
      y2: number
      stroke: string
      strokeWidth: number
    }
  | {
      id: string
      kind: 'arrow'
      x1: number
      y1: number
      x2: number
      y2: number
      stroke: string
      strokeWidth: number
    }

export function newId() {
  return `d-${crypto.randomUUID()}`
}
