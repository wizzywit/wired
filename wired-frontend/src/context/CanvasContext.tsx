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

export type { CanvasTool, DrawShape } from './canvasTypes'

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
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [tool, setTool] = useState<CanvasTool>('select')
  const [history, dispatch] = useReducer(historyReducer, initialHistory)

  const addShape = useCallback((shape: DrawShape) => {
    dispatch({ type: 'add', shape })
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
