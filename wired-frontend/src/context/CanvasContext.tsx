/* eslint-disable react-refresh/only-export-components -- context module exports hooks */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import type { CanvasTool, DrawShape } from './canvasTypes'
import { STICKY_COLOR_PRESETS } from './canvasTypes'

export type { CanvasTool, DrawShape, StrokeDashPreset } from './canvasTypes'

type HistoryState = {
  past: DrawShape[][]
  present: DrawShape[]
  future: DrawShape[][]
}

const initialHistory: HistoryState = {
  past: [],
  present: [],
  future: [],
}

type HistoryAction =
  | { type: 'add'; shape: DrawShape }
  | { type: 'updateShape'; id: string; shape: DrawShape }
  | { type: 'removeShape'; id: string }
  | { type: 'undo' }
  | { type: 'redo' }

function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case 'add':
      return {
        past: [...state.past, state.present],
        present: [...state.present, action.shape],
        future: [],
      }
    case 'updateShape':
      return {
        past: [...state.past, state.present],
        present: state.present.map((s) =>
          s.id === action.id ? action.shape : s,
        ),
        future: [],
      }
    case 'removeShape': {
      if (!state.present.some((s) => s.id === action.id)) return state
      return {
        past: [...state.past, state.present],
        present: state.present.filter((s) => s.id !== action.id),
        future: [],
      }
    }
    case 'undo': {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
      }
    }
    case 'redo': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      }
    }
    default:
      return state
  }
}

type CanvasContextValue = {
  tool: CanvasTool
  setTool: (t: CanvasTool) => void
  shapes: DrawShape[]
  addShape: (shape: DrawShape) => void
  updateShape: (id: string, shape: DrawShape) => void
  removeShape: (id: string) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  stickyColor: string
  stickyTextColor: string
  setStickyPreset: (fill: string, textColor: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

const defaultSticky = STICKY_COLOR_PRESETS[0]

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [tool, setTool] = useState<CanvasTool>('select')
  const [history, dispatch] = useReducer(historyReducer, initialHistory)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stickyColor, setStickyColor] = useState<string>(defaultSticky.fill)
  const [stickyTextColor, setStickyTextColor] = useState<string>(
    defaultSticky.textColor,
  )

  const addShape = useCallback((shape: DrawShape) => {
    dispatch({ type: 'add', shape })
  }, [])

  const updateShape = useCallback((id: string, shape: DrawShape) => {
    dispatch({ type: 'updateShape', id, shape })
  }, [])

  const removeShape = useCallback((id: string) => {
    dispatch({ type: 'removeShape', id })
  }, [])

  const setStickyPreset = useCallback((fill: string, textColor: string) => {
    setStickyColor(fill)
    setStickyTextColor(textColor)
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'undo' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'redo' })
  }, [])

  const value = useMemo(
    () => ({
      tool,
      setTool,
      shapes: history.present,
      addShape,
      updateShape,
      removeShape,
      selectedId,
      setSelectedId,
      stickyColor,
      stickyTextColor,
      setStickyPreset,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    }),
    [
      tool,
      history.present,
      history.past.length,
      history.future.length,
      addShape,
      updateShape,
      removeShape,
      selectedId,
      stickyColor,
      stickyTextColor,
      setStickyPreset,
      undo,
      redo,
    ],
  )

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  )
}

export function useCanvas() {
  const ctx = useContext(CanvasContext)
  if (!ctx) {
    throw new Error('useCanvas must be used within CanvasProvider')
  }
  return ctx
}

export function useCanvasOptional() {
  return useContext(CanvasContext)
}
