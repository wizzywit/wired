import type Konva from 'konva'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Stage as KonvaStage } from 'konva/lib/Stage'
import type { RefObject } from 'react'
import type { DrawShape, StrokeDashPreset } from '../../../context/canvasTypes'
import {
  STROKE_WIDTH_MAX,
  STROKE_WIDTH_MIN,
  TRANSFORMER_TOOLBAR_CLEARANCE_PX,
  clamp01,
  clampToolbarAnchor,
  rectsIntersectScreen,
  SELECTION_TOOLBAR_LINE_GAP_PX,
  selectionToolbarGapPx,
  toHex6,
} from '../utils'

type CanvasSelectionStyleBarProps = {
  selectedId: string | null
  shapes: DrawShape[]
  updateShape: (id: string, shape: DrawShape) => void
  /** Hide while inline text editor is open */
  hidden: boolean
  stageRef: RefObject<KonvaStage | null>
  shapeRefs: RefObject<Map<string, Konva.Node>>
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}) {
  const hex = toHex6(value)
  return (
    <label className="flex items-center gap-1.5">
      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <input
        type="color"
        aria-label={label}
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-slate-200 bg-white p-0 dark:border-slate-600 dark:bg-slate-800"
      />
    </label>
  )
}

/** When fill is off, show a checkerboard — `<input type="color">` cannot show transparent. */
function FillColorSwatch({
  label,
  value,
  fillOpacity,
  onPickColor,
}: {
  label: string
  value: string
  fillOpacity: number | undefined
  onPickColor: (hex: string) => void
}) {
  const hex = toHex6(value)
  const transparent = (fillOpacity ?? 1) <= 0
  return (
    <div className="flex items-center gap-1.5">
      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="relative h-7 w-9 shrink-0 overflow-hidden rounded border border-slate-200 dark:border-slate-600">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={
            transparent
              ? {
                  backgroundImage:
                    'repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%)',
                  backgroundSize: '10px 10px',
                }
              : { backgroundColor: hex }
          }
        />
        <input
          type="color"
          aria-label={
            transparent ? `${label} — no fill, pick a color` : `${label} color`
          }
          value={hex}
          title={
            transparent
              ? 'No fill — click to choose a color'
              : 'Fill color'
          }
          onChange={(e) => onPickColor(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  )
}

function OpacitySlider({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <label
      className={`flex min-w-[7rem] items-center gap-2 ${disabled ? 'opacity-40' : ''}`}
    >
      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        disabled={disabled}
        value={Math.round(clamp01(value) * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1 w-20 flex-1 accent-blue-600"
      />
    </label>
  )
}

function StrokeDashSelect({
  value,
  onChange,
}: {
  value: StrokeDashPreset | undefined
  onChange: (v: StrokeDashPreset | undefined) => void
}) {
  const v = value ?? 'solid'
  return (
    <label className="flex min-w-[7.5rem] items-center gap-2">
      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Line
      </span>
      <select
        aria-label="Line style"
        value={v}
        onChange={(e) => {
          const next = e.target.value as StrokeDashPreset
          onChange(next === 'solid' ? undefined : next)
        }}
        className="max-w-[7.5rem] rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      >
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
        <option value="dotted">Dotted</option>
        <option value="dashDot">Dash–dot</option>
      </select>
    </label>
  )
}

function StrokeWidthSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const v = Math.min(
    STROKE_WIDTH_MAX,
    Math.max(STROKE_WIDTH_MIN, Number.isFinite(value) ? value : 0),
  )
  return (
    <label className="flex min-w-[8rem] items-center gap-2">
      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Border
      </span>
      <input
        type="range"
        min={STROKE_WIDTH_MIN}
        max={STROKE_WIDTH_MAX}
        step={0.5}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-24 flex-1 accent-blue-600"
      />
      <span className="w-8 text-right font-mono text-[10px] text-slate-600 dark:text-slate-300">
        {v % 1 === 0 ? v : v.toFixed(1)}
      </span>
    </label>
  )
}

/**
 * When a shape is selected (select tool), adjust fill / stroke / text colors.
 * Toolbar is fixed just above the selected shape (top edge, centered).
 */
export function CanvasSelectionStyleBar({
  selectedId,
  shapes,
  updateShape,
  hidden,
  stageRef,
  shapeRefs,
}: CanvasSelectionStyleBarProps) {
  const [anchor, setAnchor] = useState<{ cx: number; top: number } | null>(null)
  const shapesRef = useRef(shapes)

  const toolbarRef = useRef<HTMLDivElement>(null)
  const toolbarSizeRef = useRef({ w: 280, h: 48 })
  const lastPublishedAnchor = useRef<{ cx: number; top: number } | null>(null)
  const lastOutOfView = useRef<boolean | null>(null)

  useLayoutEffect(() => {
    shapesRef.current = shapes
  }, [shapes])

  useLayoutEffect(() => {
    const el = toolbarRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      toolbarSizeRef.current = {
        w: Math.max(24, r.width),
        h: Math.max(24, r.height),
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [anchor])

  useEffect(() => {
    if (hidden || !selectedId) {
      lastPublishedAnchor.current = null
      lastOutOfView.current = null
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync clear when selection/tool mode hides bar
      setAnchor(null)
      return
    }
    lastPublishedAnchor.current = null
    lastOutOfView.current = null

    let rafId = 0
    const gap = selectionToolbarGapPx()

    const tick = () => {
      const stage = stageRef.current
      const node = shapeRefs.current?.get(selectedId)
      const s = shapesRef.current.find((x) => x.id === selectedId)
      if (!stage || !node || !s) {
        if (lastOutOfView.current !== true) {
          lastOutOfView.current = true
          setAnchor(null)
        }
        rafId = requestAnimationFrame(tick)
        return
      }

      const cr = stage.container().getBoundingClientRect()
      const rect = node.getClientRect({ relativeTo: stage })
      const shapeScreen = {
        left: cr.left + rect.x,
        top: cr.top + rect.y,
        right: cr.left + rect.x + rect.width,
        bottom: cr.top + rect.y + rect.height,
      }

      if (!rectsIntersectScreen(shapeScreen, cr)) {
        if (lastOutOfView.current !== true) {
          lastOutOfView.current = true
          lastPublishedAnchor.current = null
          setAnchor(null)
        }
        rafId = requestAnimationFrame(tick)
        return
      }
      lastOutOfView.current = false

      let idealCx: number
      let idealTop: number
      if (
        s.kind === 'sticky' ||
        s.kind === 'triangle' ||
        s.kind === 'kite'
      ) {
        const abs = node.getAbsoluteTransform()
        const p = abs.point({ x: s.width / 2, y: 0 })
        idealCx = cr.left + p.x
        idealTop = cr.top + p.y
      } else {
        idealCx = cr.left + rect.x + rect.width / 2
        idealTop = cr.top + rect.y
      }

      const { w, h } = toolbarSizeRef.current
      const { cx, top } = clampToolbarAnchor(idealCx, idealTop, w, h, gap, cr)

      const next = { cx, top }
      const prev = lastPublishedAnchor.current
      if (
        prev &&
        Math.abs(prev.cx - next.cx) < 0.35 &&
        Math.abs(prev.top - next.top) < 0.35
      ) {
        rafId = requestAnimationFrame(tick)
        return
      }
      lastPublishedAnchor.current = next
      setAnchor(next)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [hidden, selectedId, stageRef, shapeRefs])

  if (hidden || !selectedId) return null
  const s = shapes.find((x) => x.id === selectedId)
  if (!s || !anchor) return null

  return (
    <div
      ref={toolbarRef}
      className="pointer-events-none fixed z-[58] max-w-[min(100vw-2rem,56rem)] px-2"
      style={{
        left: anchor.cx,
        top: anchor.top,
        transform: `translate(-50%, calc(-100% - ${SELECTION_TOOLBAR_LINE_GAP_PX}px - ${TRANSFORMER_TOOLBAR_CLEARANCE_PX}px))`,
      }}
      aria-label="Shape style"
    >
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/95">
        {s.kind === 'rect' ||
        s.kind === 'ellipse' ||
        s.kind === 'triangle' ||
        s.kind === 'kite' ? (
          <>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                className="rounded border-slate-300 dark:border-slate-600"
                checked={(s.fillOpacity ?? 1) > 0}
                onChange={(e) => {
                  const on = e.target.checked
                  updateShape(s.id, {
                    ...s,
                    fillOpacity: on ? 1 : 0,
                  } as DrawShape)
                }}
              />
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Fill
              </span>
            </label>
            <FillColorSwatch
              label="Color"
              value={s.fill ?? '#2962ff'}
              fillOpacity={s.fillOpacity}
              onPickColor={(hex) =>
                updateShape(s.id, {
                  ...s,
                  fill: hex,
                  fillOpacity:
                    (s.fillOpacity ?? 1) <= 0 ? 1 : (s.fillOpacity ?? 1),
                } as DrawShape)
              }
            />
            <OpacitySlider
              label="Fill α"
              value={s.fillOpacity ?? 1}
              disabled={(s.fillOpacity ?? 1) <= 0}
              onChange={(fillOpacity) =>
                updateShape(s.id, { ...s, fillOpacity } as DrawShape)
              }
            />
            <ColorSwatch
              label="Border"
              value={s.stroke}
              onChange={(stroke) =>
                updateShape(s.id, { ...s, stroke } as DrawShape)
              }
            />
            <StrokeWidthSlider
              value={s.strokeWidth}
              onChange={(strokeWidth) =>
                updateShape(s.id, { ...s, strokeWidth } as DrawShape)
              }
            />
            <StrokeDashSelect
              value={s.strokeDash}
              onChange={(strokeDash) =>
                updateShape(s.id, { ...s, strokeDash } as DrawShape)
              }
            />
          </>
        ) : null}

        {s.kind === 'path' || s.kind === 'line' || s.kind === 'arrow' ? (
          <>
            <ColorSwatch
              label="Stroke"
              value={s.stroke}
              onChange={(stroke) =>
                updateShape(s.id, { ...s, stroke } as DrawShape)
              }
            />
            <StrokeWidthSlider
              value={s.strokeWidth}
              onChange={(strokeWidth) =>
                updateShape(s.id, { ...s, strokeWidth } as DrawShape)
              }
            />
            <StrokeDashSelect
              value={s.strokeDash}
              onChange={(strokeDash) =>
                updateShape(s.id, { ...s, strokeDash } as DrawShape)
              }
            />
          </>
        ) : null}

        {s.kind === 'text' ? (
          <ColorSwatch
            label="Text"
            value={s.fill}
            onChange={(fill) =>
              updateShape(s.id, { ...s, fill } as DrawShape)
            }
          />
        ) : null}

        {s.kind === 'sticky' ? (
          <>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                className="rounded border-slate-300 dark:border-slate-600"
                checked={(s.fillOpacity ?? 1) > 0}
                onChange={(e) => {
                  const on = e.target.checked
                  updateShape(s.id, {
                    ...s,
                    fillOpacity: on ? 1 : 0,
                  } as DrawShape)
                }}
              />
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Fill
              </span>
            </label>
            <FillColorSwatch
              label="Note"
              value={s.fill}
              fillOpacity={s.fillOpacity}
              onPickColor={(hex) =>
                updateShape(s.id, {
                  ...s,
                  fill: hex,
                  fillOpacity:
                    (s.fillOpacity ?? 1) <= 0 ? 1 : (s.fillOpacity ?? 1),
                } as DrawShape)
              }
            />
            <OpacitySlider
              label="Fill α"
              value={s.fillOpacity ?? 1}
              disabled={(s.fillOpacity ?? 1) <= 0}
              onChange={(fillOpacity) =>
                updateShape(s.id, { ...s, fillOpacity } as DrawShape)
              }
            />
            <ColorSwatch
              label="Text"
              value={s.textColor}
              onChange={(textColor) =>
                updateShape(s.id, { ...s, textColor } as DrawShape)
              }
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
