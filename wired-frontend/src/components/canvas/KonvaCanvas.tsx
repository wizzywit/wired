import { useCallback, useMemo, useRef } from 'react'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Stage as KonvaStage } from 'konva/lib/Stage'
import { Group, Layer, Rect, Stage } from 'react-konva'
import { createDotPattern } from '../../canvas/adapters/createDotPattern'
import { GRID_CELL } from '../../canvas/domain/canvasConfig'
import { useCanvasDrawing } from '../../canvas/hooks/useCanvasDrawing'
import { useCanvasViewport } from '../../canvas/hooks/useCanvasViewport'
import { CanvasDemoBoard } from '../../canvas/presentation/CanvasDemoBoard'
import { CanvasZoomHud } from '../../canvas/presentation/CanvasZoomHud'
import { getCanvasBoardColors } from '../../canvas/presentation/canvasBoardColors'
import {
  CommittedShapeNode,
  DraftShapeNode,
} from '../../canvas/presentation/shapeNodes'
import { useCanvas } from '../../context/CanvasContext'
import { useTheme } from '../../context/ThemeContext'

/**
 * View + orchestration: composes viewport and drawing hooks; delegates rules to `src/canvas/domain`.
 */
export function KonvaCanvas() {
  const { theme } = useTheme()
  const { tool, shapes, addShape } = useCanvas()
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<KonvaStage | null>(null)

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

  const { draft, drawingRef, handleDrawMouseDown } = useCanvasDrawing({
    tool,
    addShape,
    screenToWorld,
    clientToWorld,
    spaceDown,
  })

  const dotColor =
    theme === 'dark' ? 'rgba(148, 163, 184, 0.45)' : '#c3c5d8'

  const patternImage = useMemo(
    () => createDotPattern(dotColor, GRID_CELL),
    [dotColor],
  )

  const colors = getCanvasBoardColors(theme)

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
      const shouldPan =
        e.evt.button === 0 &&
        nm === 'canvas-background' &&
        tool === 'select'

      if (shouldPan) {
        startPan(p)
      }
    },
    [spaceDown, handleDrawMouseDown, startPan, tool],
  )

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (drawingRef.current) return
      handlePanMouseMove(e)
    },
    [drawingRef, handlePanMouseMove],
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
            />

            <CanvasDemoBoard colors={colors} />

            {shapes.map((s) => (
              <CommittedShapeNode key={s.id} shape={s} />
            ))}
            {draft ? (
              <DraftShapeNode draft={draft} stroke={colors.primaryBg} />
            ) : null}
          </Group>
        </Layer>
      </Stage>

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
