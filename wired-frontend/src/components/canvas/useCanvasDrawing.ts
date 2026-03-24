import type { KonvaEventObject } from 'konva/lib/Node'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CanvasTool, DrawShape } from '../../theme/canvasTypes'
import { newId } from '../../theme/canvasTypes'
import {
  commitDraft,
  createDraftFromTool,
  DEFAULT_STROKE,
  mergeDraftWithPoint,
  MIN_SHAPE_PX,
  PEN_MIN_DIST,
  type Draft,
} from './utils'

type UseCanvasDrawingDeps = {
  tool: CanvasTool
  addShape: (s: DrawShape) => void
  screenToWorld: (sx: number, sy: number) => { x: number; y: number }
  clientToWorld: (
    clientX: number,
    clientY: number,
  ) => { x: number; y: number } | null
  spaceDown: boolean
  textFill: string
  stickyFill: string
  stickyTextColor: string
  /** Default fill (hex) for new rect / ellipse */
  shapeFill: string
  /** Default fill opacity for new rect / ellipse */
  shapeFillOpacity: number
  onTextShapeCreated?: (id: string) => void
  /** After drag-draw commit (rect, ellipse, pen, line, arrow, sticky) */
  onShapeCommitted?: (id: string) => void
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
  textFill,
  stickyFill,
  stickyTextColor,
  shapeFill,
  shapeFillOpacity,
  onTextShapeCreated,
  onShapeCommitted,
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
    () => {
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
            stroke: DEFAULT_STROKE,
            newId,
            minShapePx: MIN_SHAPE_PX,
            stickyFill,
            stickyTextColor,
            shapeFill,
            shapeFillOpacity,
          })
          if (shape) {
            addShape(shape)
            onShapeCommitted?.(shape.id)
          }
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
    [
      addShape,
      clientToWorld,
      stickyFill,
      stickyTextColor,
      shapeFill,
      shapeFillOpacity,
      onShapeCommitted,
    ],
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

      if (tool === 'text') {
        const id = newId()
        addShape({
          id,
          kind: 'text',
          x: w.x,
          y: w.y,
          text: '',
          fontSize: 15,
          fill: textFill,
          width: 260,
          fontFamily: 'Inter, sans-serif',
          fontStyle: 'normal',
          align: 'left',
        })
        onTextShapeCreated?.(id)
        return true
      }

      const created = createDraftFromTool(tool, w)
      if (!created) return false
      drawingRef.current = true
      draftRef.current = created
      setDraft(created)
      attachDrawingListeners()
      return true
    },
    [
      tool,
      spaceDown,
      screenToWorld,
      addShape,
      attachDrawingListeners,
      textFill,
      onTextShapeCreated,
    ],
  )

  return {
    draft,
    drawingRef,
    handleDrawMouseDown,
  }
}
