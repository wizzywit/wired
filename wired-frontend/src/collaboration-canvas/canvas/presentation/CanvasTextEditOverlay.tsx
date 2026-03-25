import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type Konva from 'konva';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import type { RefObject } from 'react';
import type { DrawShape } from '../../../theme/canvasTypes';
import {
  TRANSFORMER_TOOLBAR_CLEARANCE_PX,
  clamp01,
  combineFontStyle,
  hexToRgba,
  parseFontStyle,
  screenBoxForNode,
  TEXT_FONT_OPTIONS,
  toHex6,
  type TextAlignOption,
} from '../utils';

type EditableShape = Extract<DrawShape, { kind: 'text' } | { kind: 'sticky' }>;

function isEditable(s: DrawShape): s is EditableShape {
  return s.kind === 'text' || s.kind === 'sticky';
}

/** Inset textarea inside sticky (world px); text uses screen px */
const STICKY_PAD_WORLD = 8;
const TEXT_PAD_SCREEN = 2;

type EditLayout = {
  /** Textarea position/size/rotation (fixed px) */
  taLeft: number;
  taTop: number;
  taWidth: number;
  taHeight: number;
  taRotationDeg: number;
  /** Toolbar centered above shape top edge */
  toolbarLeft: number;
  toolbarTop: number;
};

type CanvasTextEditOverlayProps = {
  editingId: string | null;
  shapes: DrawShape[];
  updateShape: (id: string, shape: DrawShape) => void;
  onClose: () => void;
  stageRef: RefObject<KonvaStage | null>;
  shapeRefs: RefObject<Map<string, Konva.Node>>;
  /** Re-run layout when pan/zoom/size changes */
  layoutKey: string;
  /** World → screen scale for matching Konva text size */
  viewportScale: number;
};

function measureStickyTextArea(
  node: Konva.Node,
  stage: KonvaStage,
  worldW: number,
  worldH: number,
  padWorld: number
): {
  left: number;
  top: number;
  width: number;
  height: number;
  rotationDeg: number;
} {
  const cr = stage.container().getBoundingClientRect();
  const abs = node.getAbsoluteTransform();
  const inset = Math.min(padWorld, worldW / 4, worldH / 4);
  const x1 = inset;
  const y1 = inset;
  const x2 = worldW - inset;
  const y2 = worldH - inset;
  const pTL = abs.point({ x: x1, y: y1 });
  const pTR = abs.point({ x: x2, y: y1 });
  const pBL = abs.point({ x: x1, y: y2 });
  const rotationDeg = (Math.atan2(pTR.y - pTL.y, pTR.x - pTL.x) * 180) / Math.PI;
  const width = Math.hypot(pTR.x - pTL.x, pTR.y - pTL.y);
  const height = Math.hypot(pBL.x - pTL.x, pBL.y - pTL.y);
  return {
    left: cr.left + pTL.x,
    top: cr.top + pTL.y,
    width: Math.max(32, width),
    height: Math.max(24, height),
    rotationDeg,
  };
}

export function CanvasTextEditOverlay({
  editingId,
  shapes,
  updateShape,
  onClose,
  stageRef,
  shapeRefs,
  layoutKey,
  viewportScale,
}: CanvasTextEditOverlayProps) {
  const shape: EditableShape | undefined =
    editingId == null ? undefined : shapes.find((s): s is EditableShape => s.id === editingId && isEditable(s));
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [layout, setLayout] = useState<EditLayout | null>(null);

  useLayoutEffect(() => {
    if (!editingId || !shape) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with layout pass
      setLayout(null);
      return;
    }
    const measure = () => {
      const stage = stageRef.current;
      const node = shapeRefs.current?.get(editingId);
      if (!stage || !node) return false;
      const cr = stage.container().getBoundingClientRect();

      if (shape.kind === 'sticky') {
        const w = shape.width;
        const h = shape.height;
        const abs = node.getAbsoluteTransform();
        const pMidTop = abs.point({ x: w / 2, y: 0 });
        const ta = measureStickyTextArea(node, stage, w, h, STICKY_PAD_WORLD);
        setLayout({
          taLeft: ta.left,
          taTop: ta.top,
          taWidth: ta.width,
          taHeight: ta.height,
          taRotationDeg: ta.rotationDeg,
          toolbarLeft: cr.left + pMidTop.x,
          toolbarTop: cr.top + pMidTop.y,
        });
        return true;
      }

      const box = screenBoxForNode(node, stage);
      const toolbarLeft = box.left + box.width / 2;
      const toolbarTop = box.top;
      setLayout({
        taLeft: box.left + TEXT_PAD_SCREEN,
        taTop: box.top + TEXT_PAD_SCREEN,
        taWidth: Math.max(32, box.width - TEXT_PAD_SCREEN * 2),
        taHeight: Math.max(24, box.height - TEXT_PAD_SCREEN * 2),
        taRotationDeg: 0,
        toolbarLeft,
        toolbarTop,
      });
      return true;
    };
    if (measure()) return;
    setLayout(null);
    const id = requestAnimationFrame(() => {
      measure();
    });
    return () => cancelAnimationFrame(id);
  }, [editingId, shape, layoutKey, stageRef, shapeRefs]);

  useEffect(() => {
    if (!editingId) return;
    const t = requestAnimationFrame(() => taRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [editingId]);

  useEffect(() => {
    if (!editingId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingId, onClose]);

  const applyPatch = useCallback(
    (patch: Partial<EditableShape>) => {
      if (!shape || !editingId) return;
      updateShape(editingId, { ...shape, ...patch } as DrawShape);
    },
    [shape, editingId, updateShape]
  );

  const setAlign = useCallback(
    (align: TextAlignOption) => {
      applyPatch({ align });
    },
    [applyPatch]
  );

  const setFontFamily = useCallback(
    (fontFamily: string) => {
      applyPatch({ fontFamily });
    },
    [applyPatch]
  );

  const toggleBold = useCallback(() => {
    if (!shape) return;
    const { bold, italic } = parseFontStyle(shape.fontStyle);
    applyPatch({ fontStyle: combineFontStyle(!bold, italic) });
  }, [shape, applyPatch]);

  const toggleItalic = useCallback(() => {
    if (!shape) return;
    const { bold, italic } = parseFontStyle(shape.fontStyle);
    applyPatch({ fontStyle: combineFontStyle(bold, !italic) });
  }, [shape, applyPatch]);

  const bumpFontSize = useCallback(
    (delta: number) => {
      if (!shape) return;
      const base = shape.kind === 'text' ? shape.fontSize : (shape.fontSize ?? 13);
      applyPatch({
        fontSize: Math.min(72, Math.max(8, base + delta)),
      } as Partial<EditableShape>);
    },
    [shape, applyPatch]
  );

  if (!shape || !layout) return null;

  const fontFamily = shape.fontFamily ?? 'Inter, sans-serif';
  const fontStyle = shape.fontStyle ?? 'normal';
  const align = shape.align ?? 'left';
  const { bold, italic } = parseFontStyle(fontStyle);
  const fontSize = shape.kind === 'text' ? shape.fontSize : (shape.fontSize ?? 13);
  const color = shape.kind === 'text' ? shape.fill : shape.textColor;

  const cssFontStyle = italic ? 'italic' : 'normal';
  const cssFontWeight = bold ? 700 : 400;
  const screenFont = Math.max(8, fontSize * viewportScale);
  const editBg = shape.kind === 'sticky' ? hexToRgba(shape.fill, shape.fillOpacity ?? 1) : 'transparent';

  return (
    <>
      <div
        className="pointer-events-none fixed z-[60]"
        style={{
          left: layout.toolbarLeft,
          top: layout.toolbarTop,
          transform: `translate(-50%, calc(-100% - 8px - ${TRANSFORMER_TOOLBAR_CLEARANCE_PX}px))`,
        }}
        aria-hidden
      >
        <div className="pointer-events-auto flex max-w-[min(100vw-2rem,42rem)] flex-wrap items-center justify-center gap-1 rounded-2xl border border-slate-200/90 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/95">
          {shape.kind === 'text' ? (
            <label className="flex items-center gap-1">
              <span className="sr-only">Text color</span>
              <input
                type="color"
                aria-label="Text color"
                value={toHex6(shape.fill)}
                onChange={(e) => applyPatch({ fill: e.target.value })}
                className="h-8 w-9 cursor-pointer rounded border border-slate-200 bg-white p-0 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
          ) : (
            <>
              <label className="flex items-center gap-1">
                <span className="sr-only">Note color</span>
                <input
                  type="color"
                  aria-label="Note background"
                  value={toHex6(shape.fill)}
                  onChange={(e) => applyPatch({ fill: e.target.value })}
                  className="h-8 w-9 cursor-pointer rounded border border-slate-200 bg-white p-0 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
              <label className="flex items-center gap-1">
                <span className="sr-only">Text color</span>
                <input
                  type="color"
                  aria-label="Sticky text color"
                  value={toHex6(shape.textColor)}
                  onChange={(e) => applyPatch({ textColor: e.target.value })}
                  className="h-8 w-9 cursor-pointer rounded border border-slate-200 bg-white p-0 dark:border-slate-600 dark:bg-slate-800"
                />
              </label>
              <label className="flex min-w-[6.5rem] items-center gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">α</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  aria-label="Note fill opacity"
                  value={Math.round(clamp01(shape.fillOpacity ?? 1) * 100)}
                  onChange={(e) =>
                    applyPatch({
                      fillOpacity: Number(e.target.value) / 100,
                    } as Partial<EditableShape>)
                  }
                  className="h-1 w-16 accent-blue-600"
                />
              </label>
            </>
          )}

          <div className="mx-0.5 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <select
            aria-label="Font"
            className="max-w-[8rem] rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={TEXT_FONT_OPTIONS.find((o) => o.value === fontFamily)?.id ?? 'inter'}
            onChange={(e) => {
              const opt = TEXT_FONT_OPTIONS.find((o) => o.id === e.target.value);
              if (opt) setFontFamily(opt.value);
            }}
          >
            {TEXT_FONT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            title="Bold"
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
              bold ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
            onClick={toggleBold}
          >
            B
          </button>
          <button
            type="button"
            title="Italic"
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm italic ${
              italic ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
            onClick={toggleItalic}
          >
            I
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <button
            type="button"
            title="Smaller"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => bumpFontSize(-1)}
          >
            A−
          </button>
          <span className="min-w-[2rem] text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
            {Math.round(fontSize)}
          </span>
          <button
            type="button"
            title="Larger"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => bumpFontSize(1)}
          >
            A+
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              type="button"
              title={`Align ${a}`}
              className={`rounded-lg px-2 py-1 text-xs font-bold uppercase ${
                align === a
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
              onClick={() => setAlign(a)}
            >
              {a === 'left' ? 'L' : a === 'center' ? 'C' : 'R'}
            </button>
          ))}

          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-600" />

          <button
            type="button"
            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold uppercase text-white"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>

      <textarea
        ref={taRef}
        className="fixed z-[55] resize-none shadow-none outline-none"
        style={{
          left: layout.taLeft,
          top: layout.taTop,
          width: layout.taWidth,
          minHeight: layout.taHeight,
          padding: shape.kind === 'sticky' ? 4 : 2,
          fontFamily,
          fontSize: `${screenFont}px`,
          fontStyle: cssFontStyle,
          fontWeight: cssFontWeight,
          textAlign: align,
          color,
          backgroundColor: editBg,
          border: '2px solid rgba(41, 98, 255, 0.55)',
          boxSizing: 'border-box',
          transform: `rotate(${layout.taRotationDeg}deg)`,
          transformOrigin: 'top left',
        }}
        value={shape.text}
        onChange={(e) => applyPatch({ text: e.target.value } as Partial<EditableShape>)}
      />
    </>
  );
}
