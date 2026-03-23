import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Stage as KonvaStage } from 'konva/lib/Stage'
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva'
import { createDotPattern } from '../../canvas/adapters/createDotPattern'
import { GRID_CELL } from '../../canvas/domain/canvasConfig'
import { isTypingTarget } from '../../canvas/domain/domFocus'
import { useCanvasDrawing } from '../../canvas/hooks/useCanvasDrawing'
import { useCanvasViewport } from '../../canvas/hooks/useCanvasViewport'
import { CanvasDemoBoard } from '../../canvas/presentation/CanvasDemoBoard'
import { CanvasSelectionStyleBar } from '../../canvas/presentation/CanvasSelectionStyleBar'
import { CanvasTextEditOverlay } from '../../canvas/presentation/CanvasTextEditOverlay'
import { CanvasZoomHud } from '../../canvas/presentation/CanvasZoomHud'
import { getCanvasBoardColors } from '../../canvas/presentation/canvasBoardColors'
import {
  CommittedShapeNode,
  DraftShapeNode,
} from '../../canvas/presentation/shapeNodes'
import { useCanvas } from '../../context/CanvasContext'
import { useTheme } from '../../context/ThemeContext'

const BG_DRAG_THRESHOLD_SQ = 25

/**
 * View + orchestration: composes viewport and drawing hooks; delegates rules to `src/canvas/domain`.
 */
export function KonvaCanvas() {
  const { theme } = useTheme()
  const {
    tool,
    setTool,
    shapes,
    addShape,
    updateShape,
    removeShape,
    selectedId,
    setSelectedId,
    stickyColor,
    stickyTextColor,
  } = useCanvas()
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<KonvaStage | null>(null)
  const transformerRef = useRef<Konva.Transformer | null>(null)
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map())
  const prevToolRef = useRef(tool)
  /** Left-click canvas bg: drag past threshold → pan; else release → deselect */
  const emptyBgPanRef = useRef<{
    sx: number
    sy: number
    started: boolean
  } | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    size,
    viewport,
    spaceDown,
    isPanning,
    screenToWorld,
    clientToWorld,
    handleWheel,
    handlePanMouseMove,
    startPan,
    endPanOnLeave,
    zoomFromCenter,
    resetView,
    zoomPercent,
    originX,
    originY,
  } = useCanvasViewport(containerRef, stageRef)

  const colors = getCanvasBoardColors(theme)

  const { draft, drawingRef, handleDrawMouseDown } = useCanvasDrawing({
    tool,
    addShape,
    screenToWorld,
    clientToWorld,
    spaceDown,
    textFill: colors.onSurface,
    stickyFill: stickyColor,
    stickyTextColor,
    shapeFill: colors.primaryBg,
    shapeFillOpacity: 0.15,
    onTextShapeCreated: (id) => setEditingId(id),
    onShapeCommitted: (id) => {
      requestAnimationFrame(() => {
        setSelectedId(id)
        setTool('select')
      })
    },
  })

  const dotColor =
    theme === 'dark' ? 'rgba(148, 163, 184, 0.45)' : '#c3c5d8'

  const patternImage = useMemo(
    () => createDotPattern(dotColor, GRID_CELL),
    [dotColor],
  )

  const layoutKey = `${originX}-${originY}-${viewport.scale}-${size.w}-${size.h}`

  useEffect(() => {
    if (prevToolRef.current !== tool) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tool switch closes editor
      setEditingId(null)
      prevToolRef.current = tool
    }
  }, [tool])

  useEffect(() => {
    if (editingId && !shapes.some((s) => s.id === editingId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- shape removed while editing
      setEditingId(null)
    }
  }, [shapes, editingId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (isTypingTarget(e.target)) return
      if (editingId) return
      if (tool !== 'select' || !selectedId) return
      e.preventDefault()
      removeShape(selectedId)
      setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tool, selectedId, editingId, removeShape, setSelectedId])

  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    if (editingId) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }
    if (tool !== 'select' || !selectedId) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }
    const sel = shapes.find((s) => s.id === selectedId)
    if (!sel || sel.kind === 'path') {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }
    const node = shapeRefs.current.get(selectedId) ?? null
    if (node) {
      tr.nodes([node])
      tr.getLayer()?.batchDraw()
    } else {
      tr.nodes([])
    }
  }, [editingId, selectedId, shapes, tool])

  useEffect(() => {
    const onUp = () => {
      const cand = emptyBgPanRef.current
      if (cand && !cand.started && tool === 'select') {
        setSelectedId(null)
        setEditingId(null)
      }
      emptyBgPanRef.current = null
    }
    window.addEventListener('pointerup', onUp)
    return () => window.removeEventListener('pointerup', onUp)
  }, [tool, setSelectedId])

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (!stage) return
      const p = stage.getPointerPosition()
      if (!p) return

      if (e.evt.button === 1 || spaceDown) {
        startPan(p)
        return
      }

      if (e.evt.button === 0 && handleDrawMouseDown(e)) {
        return
      }

      const target = e.target
      const nm = typeof target.name === 'function' ? target.name() : ''
      if (
        e.evt.button === 0 &&
        nm === 'canvas-background' &&
        tool === 'select'
      ) {
        emptyBgPanRef.current = { sx: p.x, sy: p.y, started: false }
      }
    },
    [spaceDown, handleDrawMouseDown, startPan, tool],
  )

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (drawingRef.current) return
      const stage = e.target.getStage()
      if (stage) {
        const cand = emptyBgPanRef.current
        if (cand && !cand.started) {
          const p = stage.getPointerPosition()
          if (p) {
            const dx = p.x - cand.sx
            const dy = p.y - cand.sy
            if (dx * dx + dy * dy > BG_DRAG_THRESHOLD_SQ) {
              cand.started = true
              startPan(p)
            }
          }
        }
      }
      handlePanMouseMove(e)
    },
    [drawingRef, handlePanMouseMove, startPan],
  )

  const cursorClass =
    isPanning || spaceDown
      ? isPanning
        ? 'cursor-grabbing'
        : 'cursor-grab'
      : tool !== 'select'
        ? 'cursor-crosshair'
        : 'cursor-default'

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 touch-none ${cursorClass}`}
      style={{ touchAction: 'none' }}
    >
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={endPanOnLeave}
      >
        <Layer>
          <Group
            x={originX}
            y={originY}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
          >
            <Rect
              name="canvas-background"
              x={-5000}
              y={-5000}
              width={10000}
              height={10000}
              fillPatternImage={
                patternImage as unknown as HTMLImageElement
              }
              fillPatternRepeat="repeat"
              listening
              onTap={(e) => {
                e.cancelBubble = true
                if (tool === 'select') {
                  setSelectedId(null)
                  setEditingId(null)
                }
              }}
            />

            <CanvasDemoBoard colors={colors} />

            {shapes.map((s) => (
              <CommittedShapeNode
                key={s.id}
                shape={s}
                interaction={{
                  interactive: tool === 'select',
                  onSelect: () => setSelectedId(s.id),
                  onChange: (next) => updateShape(s.id, next),
                  innerRef: (node) => {
                    if (node) shapeRefs.current.set(s.id, node)
                    else shapeRefs.current.delete(s.id)
                  },
                  isEditing: editingId === s.id,
                  onBeginEdit: () => setEditingId(s.id),
                }}
              />
            ))}
            {draft ? (
              <DraftShapeNode
                draft={draft}
                stroke={colors.primaryBg}
                stickyFill={stickyColor}
              />
            ) : null}

            <Transformer
              ref={transformerRef}
              rotateEnabled
              borderStroke="#2962ff"
              borderStrokeWidth={1}
              anchorFill="#ffffff"
              anchorStroke="#2962ff"
              boundBoxFunc={(_oldBox, newBox) => ({
                ...newBox,
                width: Math.max(8, newBox.width),
                height: Math.max(8, newBox.height),
              })}
            />
          </Group>
        </Layer>
      </Stage>

      <CanvasTextEditOverlay
        editingId={editingId}
        shapes={shapes}
        updateShape={updateShape}
        onClose={() => setEditingId(null)}
        stageRef={stageRef}
        shapeRefs={shapeRefs}
        layoutKey={layoutKey}
        viewportScale={viewport.scale}
      />

      <CanvasSelectionStyleBar
        selectedId={selectedId}
        shapes={shapes}
        updateShape={updateShape}
        hidden={editingId !== null || tool !== 'select'}
        stageRef={stageRef}
        shapeRefs={shapeRefs}
      />

      <CanvasZoomHud
        zoomPercent={zoomPercent}
        onZoomOut={() => zoomFromCenter(1 / 1.1)}
        onZoomIn={() => zoomFromCenter(1.1)}
        onResetView={resetView}
      />

      {spaceDown ? (
        <div className="pointer-events-none absolute left-3 top-3 z-40 rounded-md bg-surface-container-high/90 px-2 py-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          Pan mode — drag
        </div>
      ) : null}
    </div>
  )
}
