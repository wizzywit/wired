import type { KonvaEventObject } from 'konva/lib/Node'
import type { Stage as KonvaStage } from 'konva/lib/Stage'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { clientToWorldFromStage } from '../adapters/stagePointer'
import {
  applyPanDelta,
  screenPointToWorld,
  zoomAtCenter,
  zoomWheelAtPointer,
} from '../domain/viewport'
import type { Viewport } from '../domain/viewport'

type PanRef = {
  active: boolean
  lastX: number
  lastY: number
}

/**
 * Orchestrates pan/zoom viewport math (domain) with resize + keyboard (adapter).
 */
export function useCanvasViewport(
  containerRef: RefObject<HTMLDivElement | null>,
  stageRef: RefObject<KonvaStage | null>,
) {
  const [size, setSize] = useState({ w: 100, h: 100 })
  const [viewport, setViewport] = useState<Viewport>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })
  const [spaceDown, setSpaceDown] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const panRef = useRef<PanRef>({ active: false, lastX: 0, lastY: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpaceDown(true)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpaceDown(false)
        panRef.current.active = false
        setIsPanning(false)
      }
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
    }
  }, [])

  useEffect(() => {
    const endPan = () => {
      panRef.current.active = false
      setIsPanning(false)
    }
    window.addEventListener('mouseup', endPan)
    window.addEventListener('blur', endPan)
    return () => {
      window.removeEventListener('mouseup', endPan)
      window.removeEventListener('blur', endPan)
    }
  }, [])

  const screenToWorld = useCallback(
    (sx: number, sy: number) => {
      return screenPointToWorld(sx, sy, size.w, size.h, viewport)
    },
    [size.w, size.h, viewport],
  )

  const clientToWorld = useCallback(
    (clientX: number, clientY: number) => {
      return clientToWorldFromStage(
        clientX,
        clientY,
        stageRef.current?.container() ?? null,
        size.w,
        size.h,
        viewport,
      )
    },
    [size.w, size.h, viewport, stageRef],
  )

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const stage = e.target.getStage()
      if (!stage) return
      const pointer = stage.getPointerPosition()
      if (!pointer) return
      const scaleBy = e.evt.deltaY > 0 ? 0.9 : 1.1
      setViewport((prev) =>
        zoomWheelAtPointer(prev, pointer, size.w, size.h, scaleBy),
      )
    },
    [size.w, size.h],
  )

  const handlePanMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!panRef.current.active) return
      const stage = e.target.getStage()
      if (!stage) return
      const p = stage.getPointerPosition()
      if (!p) return
      const dx = p.x - panRef.current.lastX
      const dy = p.y - panRef.current.lastY
      panRef.current.lastX = p.x
      panRef.current.lastY = p.y
      setViewport((v) => applyPanDelta(v, { dx, dy }))
    },
    [],
  )

  const startPan = useCallback((p: { x: number; y: number }) => {
    panRef.current = { active: true, lastX: p.x, lastY: p.y }
    setIsPanning(true)
  }, [])

  const endPanOnLeave = useCallback(() => {
    panRef.current.active = false
    setIsPanning(false)
  }, [])

  const zoomFromCenter = useCallback(
    (factor: number) => {
      setViewport((prev) => zoomAtCenter(prev, size.w, size.h, factor))
    },
    [size.w, size.h],
  )

  const resetView = useCallback(() => {
    setViewport({ scale: 1, offsetX: 0, offsetY: 0 })
  }, [])

  const zoomPercent = Math.round(viewport.scale * 100)

  const originX = size.w / 2 + viewport.offsetX
  const originY = size.h / 2 + viewport.offsetY

  return {
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
  }
}
