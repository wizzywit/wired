import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import {
  createDotPattern,
  GRID_CELL,
  unionBoundsForShapes,
  viewportCenteredOnBoundsAtScale,
  type WorldAxisBounds,
} from './utils';
import { getCanvasBoardColors } from './canvasBoardColors';
import { useTheme } from '../../theme/ThemeContext';
import { useCanvasStore } from './canvasStore';
import { useCanvasDrawing } from './useCanvasDrawing';
import { useCanvasViewport } from './useCanvasViewport';
import { useKonvaCanvasInteractionEffects } from './useKonvaCanvasInteractionEffects';
import { useKonvaCanvasPointerHandlers } from './useKonvaCanvasPointerHandlers';

export type KonvaCanvasControllerOptions = {
  onPointerWorldMove?: (pt: { x: number; y: number }) => void;
  onStageMouseLeaveExtra?: () => void;
  readOnly?: boolean;
  /** One-shot: zoom/pan to frame these world bounds (e.g. after template seed). */
  worldBoundsToFit?: WorldAxisBounds | null;
  onWorldBoundsFitConsumed?: () => void;
};

export function useKonvaCanvasController(opts?: KonvaCanvasControllerOptions) {
  const onPointerWorldMoveRef = useRef(opts?.onPointerWorldMove);
  const onStageMouseLeaveExtraRef = useRef(opts?.onStageMouseLeaveExtra);

  useEffect(() => {
    onPointerWorldMoveRef.current = opts?.onPointerWorldMove;
    onStageMouseLeaveExtraRef.current = opts?.onStageMouseLeaveExtra;
  }, [opts?.onPointerWorldMove, opts?.onStageMouseLeaveExtra]);

  const onWorldBoundsFitConsumedRef = useRef(opts?.onWorldBoundsFitConsumed);
  useEffect(() => {
    onWorldBoundsFitConsumedRef.current = opts?.onWorldBoundsFitConsumed;
  }, [opts?.onWorldBoundsFitConsumed]);

  const worldBoundsToFit = opts?.worldBoundsToFit ?? null;
  const boundsKey = useMemo(
    () =>
      worldBoundsToFit
        ? `${worldBoundsToFit.minX},${worldBoundsToFit.minY},${worldBoundsToFit.maxX},${worldBoundsToFit.maxY}`
        : null,
    [worldBoundsToFit]
  );
  const focusConsumedRef = useRef(false);
  const lastBoundsKeyRef = useRef<string | null>(null);

  const { theme } = useTheme();
  const readOnly = Boolean(opts?.readOnly);
  const tool = useCanvasStore((state) => state.tool);
  const setTool = useCanvasStore((state) => state.setTool);
  const shapes = useCanvasStore((state) => state.history.present);
  const addShape = useCanvasStore((state) => state.addShape);
  const updateShape = useCanvasStore((state) => state.updateShape);
  const removeShape = useCanvasStore((state) => state.removeShape);
  const selectedId = useCanvasStore((state) => state.selectedId);
  const setSelectedId = useCanvasStore((state) => state.setSelectedId);
  const editingId = useCanvasStore((state) => state.editingId);
  const setEditingId = useCanvasStore((state) => state.setEditingId);
  const stickyColor = useCanvasStore((state) => state.stickyColor);
  const stickyTextColor = useCanvasStore((state) => state.stickyTextColor);

  useEffect(() => {
    if (!readOnly) return;
    if (tool !== 'select') {
      setTool('select');
    }
    if (editingId !== null) {
      setEditingId(null);
    }
  }, [editingId, readOnly, setEditingId, setTool, tool]);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<KonvaStage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const shapeRefs = useRef<Map<string, Konva.Node>>(new Map());
  const emptyBgPanRef = useRef<{
    sx: number;
    sy: number;
    started: boolean;
  } | null>(null);

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
    setViewport,
    focusWorldBounds,
    zoomPercent,
    originX,
    originY,
  } = useCanvasViewport(containerRef, stageRef);

  useLayoutEffect(() => {
    if (!worldBoundsToFit || !boundsKey) {
      focusConsumedRef.current = false;
      lastBoundsKeyRef.current = null;
      return;
    }
    if (lastBoundsKeyRef.current !== boundsKey) {
      lastBoundsKeyRef.current = boundsKey;
      focusConsumedRef.current = false;
    }
    if (size.w < 10 || size.h < 10) return;
    focusWorldBounds(worldBoundsToFit);
    if (size.w >= 120 && size.h >= 120 && !focusConsumedRef.current) {
      focusConsumedRef.current = true;
      onWorldBoundsFitConsumedRef.current?.();
    }
  }, [boundsKey, worldBoundsToFit, size.w, size.h, focusWorldBounds]);

  const resetView = useCallback(() => {
    const b = unionBoundsForShapes(shapes);
    setViewport(viewportCenteredOnBoundsAtScale(b, 1));
  }, [shapes, setViewport]);

  const colors = getCanvasBoardColors(theme);

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
        setSelectedId(id);
        setTool('select');
      });
    },
  });

  const dotColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.45)' : '#c3c5d8';

  const patternImage = useMemo(() => createDotPattern(dotColor, GRID_CELL), [dotColor]);

  const layoutKey = `${originX}-${originY}-${viewport.scale}-${size.w}-${size.h}`;

  useKonvaCanvasInteractionEffects({
    tool,
    shapes,
    selectedId,
    editingId,
    setEditingId,
    setSelectedId,
    removeShape: readOnly ? () => {} : removeShape,
    transformerRef,
    shapeRefs,
    emptyBgPanRef,
  });

  const {
    handleMouseDown,
    handleMouseMove: pointerMouseMove,
    cursorClass,
  } = useKonvaCanvasPointerHandlers({
    tool: readOnly ? 'select' : tool,
    spaceDown,
    isPanning,
    handleDrawMouseDown,
    handlePanMouseMove,
    startPan,
    drawingRef,
    emptyBgPanRef,
  });

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      pointerMouseMove(e);
      const fn = onPointerWorldMoveRef.current;
      if (fn) {
        const stage = e.target.getStage();
        const p = stage?.getPointerPosition();
        if (p) fn(screenToWorld(p.x, p.y));
      }
    },
    [pointerMouseMove, screenToWorld]
  );

  const endPanOnLeaveWrapped = useCallback(() => {
    endPanOnLeave();
    onStageMouseLeaveExtraRef.current?.();
  }, [endPanOnLeave]);

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
    endPanOnLeave: endPanOnLeaveWrapped,
    zoomFromCenter,
    resetView,
  };
}
