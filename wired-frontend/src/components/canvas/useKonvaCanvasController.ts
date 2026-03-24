import { useMemo, useRef } from 'react'
import type Konva from 'konva'
import type { Stage as KonvaStage } from 'konva/lib/Stage'
import { createDotPattern, GRID_CELL } from './utils'
import { getCanvasBoardColors } from './canvasBoardColors'
import { useTheme } from '../../context/ThemeContext'
import { useCanvasStore } from './canvasStore'
import { useCanvasDrawing } from './useCanvasDrawing'
import { useCanvasViewport } from './useCanvasViewport'
import { useKonvaCanvasInteractionEffects } from './useKonvaCanvasInteractionEffects'
import { useKonvaCanvasPointerHandlers } from './useKonvaCanvasPointerHandlers'

export function useKonvaCanvasController() {
  const { theme } = useTheme()
  const tool = useCanvasStore((state) => state.tool)
  const setTool = useCanvasStore((state) => state.setTool)
  const shapes = useCanvasStore((state) => state.history.present)
  const addShape = useCanvasStore((state) => state.addShape)
  const updateShape = useCanvasStore((state) => state.updateShape)
  const removeShape = useCanvasStore((state) => state.removeShape)
  const selectedId = useCanvasStore((state) => state.selectedId)
  const setSelectedId = useCanvasStore((state) => state.setSelectedId)
  const editingId = useCanvasStore((state) => state.editingId)
  const setEditingId = useCanvasStore((state) => state.setEditingId)
  const stickyColor = useCanvasStore((state) => state.stickyColor)
  const stickyTextColor = useCanvasStore((state) => state.stickyTextColor)

  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<KonvaStage | null>(null)
  const transformerRef = useRef<Konva.Transformer | null>(null)
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map())
  const emptyBgPanRef = useRef<{
    sx: number
    sy: number
    started: boolean
  } | null>(null)

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

  useKonvaCanvasInteractionEffects({
    tool,
    shapes,
    selectedId,
    editingId,
    setEditingId,
    setSelectedId,
    removeShape,
    transformerRef,
    shapeRefs,
    emptyBgPanRef,
  })

  const { handleMouseDown, handleMouseMove, cursorClass } =
    useKonvaCanvasPointerHandlers({
      tool,
      spaceDown,
      isPanning,
      handleDrawMouseDown,
      handlePanMouseMove,
      startPan,
      drawingRef,
      emptyBgPanRef,
    })

  return {
    containerRef,
    stageRef,
    transformerRef,
    shapeRefs,
    tool,
    shapes,
    selectedId,
    editingId,
    stickyColor,
    draft,
    colors,
    viewport,
    size,
    spaceDown,
    zoomPercent,
    originX,
    originY,
    patternImage,
    layoutKey,
    cursorClass,
    setEditingId,
    setSelectedId,
    updateShape,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    endPanOnLeave,
    zoomFromCenter,
    resetView,
  }
}
