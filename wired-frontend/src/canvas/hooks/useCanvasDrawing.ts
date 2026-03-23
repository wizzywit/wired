import type { KonvaEventObject } from 'konva/lib/Node'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CanvasTool, DrawShape } from '../../context/canvasTypes'
import { newId } from '../../context/canvasTypes'
import {
  DEFAULT_STROKE,
  MIN_SHAPE_PX,
  PEN_MIN_DIST,
} from '../domain/canvasConfig'
import {
  commitDraft,
  createDraftFromTool,
  mergeDraftWithPoint,
  type Draft,
} from '../domain/drawingDraft'

type UseCanvasDrawingDeps = {
  tool: CanvasTool
  addShape: (s: DrawShape) => void
  screenToWorld: (sx: number, sy: number) => { x: number; y: number }
  clientToWorld: (
    clientX: number,
    clientY: number,
  ) => { x: number; y: number } | null
  spaceDown: boolean
}

/**
 * Orchestrates drawing use-case: draft lifecycle + window pointer listeners (adapter).
 */
export function useCanvasDrawing({
  tool,
  addShape,
  screenToWorld,
  clientToWorld,
  spaceDown,
}: UseCanvasDrawingDeps) {
  const drawingRef = useRef(false)
  const draftRef = useRef<Draft | null>(null)
  const drawingCleanupRef = useRef<(() => void) | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)

  useEffect(() => {
    return () => {
      drawingCleanupRef.current?.()
      drawingCleanupRef.current = null
    }
  }, [])

  const attachDrawingListeners = useCallback(
    (stroke: string) => {
      drawingCleanupRef.current?.()

      const onMove = (e: MouseEvent) => {
        const w = clientToWorld(e.clientX, e.clientY)
        if (!w) return
        setDraft((d) => {
          const cur = d ?? draftRef.current
          if (!cur) return d
          const next = mergeDraftWithPoint(cur, w, PEN_MIN_DIST)
          draftRef.current = next
          return next
        })
      }

      const onKey = (e: KeyboardEvent) => {
        if (e.code === 'Escape') {
          draftRef.current = null
          setDraft(null)
          drawingRef.current = false
          teardown()
        }
      }

      const teardown = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        window.removeEventListener('keydown', onKey)
        drawingCleanupRef.current = null
      }

      const onUp = () => {
        const d = draftRef.current
        draftRef.current = null
        if (d) {
          const shape = commitDraft(d, {
            stroke,
            newId,
            minShapePx: MIN_SHAPE_PX,
          })
          if (shape) addShape(shape)
        }
        setDraft(null)
        drawingRef.current = false
        teardown()
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
      window.addEventListener('keydown', onKey)
      drawingCleanupRef.current = teardown
    },
    [addShape, clientToWorld],
  )

  const handleDrawMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0 || spaceDown) return false
      if (tool === 'select') return false
      const stage = e.target.getStage()
      if (!stage) return false
      const p = stage.getPointerPosition()
      if (!p) return false
      const w = screenToWorld(p.x, p.y)
      const created = createDraftFromTool(tool, w)
      if (!created) return false
      drawingRef.current = true
      draftRef.current = created
      setDraft(created)
      attachDrawingListeners(DEFAULT_STROKE)
      return true
    },
    [tool, spaceDown, screenToWorld, attachDrawingListeners],
  )

  return {
    draft,
    drawingRef,
    handleDrawMouseDown,
  }
}
