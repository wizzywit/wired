import type { DrawShape } from '../context/canvasTypes'

export type CanvasPatchOp =
  | { type: 'add'; shape: DrawShape }
  | { type: 'update'; id: string; shape: DrawShape }
  | { type: 'remove'; id: string }
  | { type: 'replace_all'; shapes: DrawShape[] }

function stableShapeKey(shape: DrawShape): string {
  return JSON.stringify(shape)
}

export function diffShapesToPatch(
  previous: DrawShape[],
  next: DrawShape[],
): CanvasPatchOp[] {
  const prevMap = new Map(previous.map((shape) => [shape.id, shape] as const))
  const nextMap = new Map(next.map((shape) => [shape.id, shape] as const))

  const ops: CanvasPatchOp[] = []

  for (const [id, prevShape] of prevMap) {
    if (!nextMap.has(id)) {
      ops.push({ type: 'remove', id })
      continue
    }
    const nextShape = nextMap.get(id)!
    if (stableShapeKey(prevShape) !== stableShapeKey(nextShape)) {
      ops.push({ type: 'update', id, shape: nextShape })
    }
  }

  for (const [id, nextShape] of nextMap) {
    if (!prevMap.has(id)) {
      ops.push({ type: 'add', shape: nextShape })
    }
  }

  if (ops.length === 0) return ops

  // Full replace is safer for very large local bursts.
  if (ops.length > 25) {
    return [{ type: 'replace_all', shapes: next }]
  }

  return ops
}

export function applyPatchOps(
  current: DrawShape[],
  operations: CanvasPatchOp[],
): DrawShape[] {
  let working = current

  for (const op of operations) {
    if (op.type === 'replace_all') {
      working = op.shapes
      continue
    }

    if (op.type === 'add') {
      const exists = working.some((shape) => shape.id === op.shape.id)
      working = exists
        ? working.map((shape) => (shape.id === op.shape.id ? op.shape : shape))
        : [...working, op.shape]
      continue
    }

    if (op.type === 'update') {
      working = working.map((shape) => (shape.id === op.id ? op.shape : shape))
      continue
    }

    working = working.filter((shape) => shape.id !== op.id)
  }

  return working
}
