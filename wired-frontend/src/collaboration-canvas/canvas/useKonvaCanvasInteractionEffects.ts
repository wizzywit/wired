import { useEffect, type MutableRefObject } from 'react';
import type Konva from 'konva';
import type { DrawShape, CanvasTool } from '../../theme/canvasTypes';
import { isTypingTarget } from './utils';

type EmptyBgPanRef = MutableRefObject<{
  sx: number;
  sy: number;
  started: boolean;
} | null>;

type UseKonvaCanvasInteractionEffectsArgs = {
  tool: CanvasTool;
  shapes: DrawShape[];
  selectedId: string | null;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  setSelectedId: (id: string | null) => void;
  removeShape: (id: string) => void;
  transformerRef: MutableRefObject<Konva.Transformer | null>;
  shapeRefs: MutableRefObject<Map<string, Konva.Node>>;
  emptyBgPanRef: EmptyBgPanRef;
};

export function useKonvaCanvasInteractionEffects({
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
}: UseKonvaCanvasInteractionEffectsArgs) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (isTypingTarget(e.target)) return;
      if (editingId) return;
      if (tool !== 'select' || !selectedId) return;
      e.preventDefault();
      removeShape(selectedId);
      setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, selectedId, editingId, removeShape, setSelectedId]);

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (editingId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    if (tool !== 'select' || !selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const sel = shapes.find((s) => s.id === selectedId);
    if (!sel || sel.kind === 'path') {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = shapeRefs.current.get(selectedId) ?? null;
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
    }
  }, [editingId, selectedId, shapes, tool, transformerRef, shapeRefs]);

  useEffect(() => {
    const onUp = () => {
      const cand = emptyBgPanRef.current;
      if (cand && !cand.started && tool === 'select') {
        setSelectedId(null);
        setEditingId(null);
      }
      emptyBgPanRef.current = null;
    };
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, [tool, setSelectedId, setEditingId, emptyBgPanRef]);
}
