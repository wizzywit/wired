import { useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CanvasTool } from '../../theme/canvasTypes';
import type { MutableRefObject } from 'react';

const BG_DRAG_THRESHOLD_SQ = 25;

type UseKonvaCanvasPointerHandlersArgs = {
  tool: CanvasTool;
  spaceDown: boolean;
  isPanning: boolean;
  handleDrawMouseDown: (e: KonvaEventObject<MouseEvent>) => boolean;
  handlePanMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
  startPan: (point: { x: number; y: number }) => void;
  drawingRef: MutableRefObject<unknown>;
  emptyBgPanRef: MutableRefObject<{
    sx: number;
    sy: number;
    started: boolean;
  } | null>;
};

export function useKonvaCanvasPointerHandlers({
  tool,
  spaceDown,
  isPanning,
  handleDrawMouseDown,
  handlePanMouseMove,
  startPan,
  drawingRef,
  emptyBgPanRef,
}: UseKonvaCanvasPointerHandlersArgs) {
  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const p = stage.getPointerPosition();
      if (!p) return;

      if (e.evt.button === 1 || spaceDown) {
        startPan(p);
        return;
      }

      if (e.evt.button === 0 && handleDrawMouseDown(e)) {
        return;
      }

      const target = e.target;
      const nm = typeof target.name === 'function' ? target.name() : '';
      if (e.evt.button === 0 && nm === 'canvas-background' && tool === 'select') {
        emptyBgPanRef.current = { sx: p.x, sy: p.y, started: false };
      }
    },
    [spaceDown, handleDrawMouseDown, startPan, tool, emptyBgPanRef]
  );

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (drawingRef.current) return;
      const stage = e.target.getStage();
      if (stage) {
        const cand = emptyBgPanRef.current;
        if (cand && !cand.started) {
          const p = stage.getPointerPosition();
          if (p) {
            const dx = p.x - cand.sx;
            const dy = p.y - cand.sy;
            if (dx * dx + dy * dy > BG_DRAG_THRESHOLD_SQ) {
              cand.started = true;
              startPan(p);
            }
          }
        }
      }
      handlePanMouseMove(e);
    },
    [drawingRef, handlePanMouseMove, startPan, emptyBgPanRef]
  );

  const cursorClass =
    isPanning || spaceDown
      ? isPanning
        ? 'cursor-grabbing'
        : 'cursor-grab'
      : tool !== 'select'
        ? 'cursor-crosshair'
        : 'cursor-default';

  return {
    handleMouseDown,
    handleMouseMove,
    cursorClass,
  };
}
