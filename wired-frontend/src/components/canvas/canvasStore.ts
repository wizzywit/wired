import { create } from 'zustand'
import type { CanvasTool, DrawShape } from '../../context/canvasTypes'
import { STICKY_COLOR_PRESETS } from '../../context/canvasTypes'
type HistoryState = {
  past: DrawShape[][]
  present: DrawShape[]
  future: DrawShape[][]
}

type CanvasStore = {
  tool: CanvasTool
  history: HistoryState
  selectedId: string | null
  editingId: string | null
  stickyColor: string
  stickyTextColor: string
  setTool: (tool: CanvasTool) => void
  addShape: (shape: DrawShape) => void
  updateShape: (id: string, shape: DrawShape) => void
  removeShape: (id: string) => void
  replaceShapes: (shapes: DrawShape[]) => void
  setSelectedId: (id: string | null) => void
  setEditingId: (id: string | null) => void
  setStickyPreset: (fill: string, textColor: string) => void
  undo: () => void
  redo: () => void
}

const defaultSticky = STICKY_COLOR_PRESETS[0]

const initialHistory: HistoryState = {
  past: [],
  present: [],
  future: [],
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  tool: 'select',
  history: initialHistory,
  selectedId: null,
  editingId: null,
  stickyColor: defaultSticky.fill,
  stickyTextColor: defaultSticky.textColor,
  setTool: (tool) => set({ tool, editingId: null }),
  addShape: (shape) =>
    set((state) => ({
      history: {
        past: [...state.history.past, state.history.present],
        present: [...state.history.present, shape],
        future: [],
      },
    })),
  updateShape: (id, shape) =>
    set((state) => ({
      history: {
        past: [...state.history.past, state.history.present],
        present: state.history.present.map((s) => (s.id === id ? shape : s)),
        future: [],
      },
    })),
  removeShape: (id) =>
    set((state) => {
      if (!state.history.present.some((s) => s.id === id)) {
        return state
      }
      return {
        selectedId: state.selectedId === id ? null : state.selectedId,
        editingId: state.editingId === id ? null : state.editingId,
        history: {
          past: [...state.history.past, state.history.present],
          present: state.history.present.filter((s) => s.id !== id),
          future: [],
        },
      }
    }),
  replaceShapes: (shapes) =>
    set((state) => {
      const presentIds = new Set(shapes.map((shape) => shape.id))
      return {
        selectedId:
          state.selectedId && presentIds.has(state.selectedId)
            ? state.selectedId
            : null,
        editingId:
          state.editingId && presentIds.has(state.editingId)
            ? state.editingId
            : null,
        history: {
          past: [],
          present: shapes,
          future: [],
        },
      }
    }),
  setSelectedId: (id) => set({ selectedId: id }),
  setEditingId: (id) => set({ editingId: id }),
  setStickyPreset: (fill, textColor) =>
    set({ stickyColor: fill, stickyTextColor: textColor }),
  undo: () =>
    set((state) => {
      if (state.history.past.length === 0) return state
      const prev = state.history.past[state.history.past.length - 1]
      const prevIds = new Set(prev.map((shape) => shape.id))
      return {
        selectedId:
          state.selectedId && prevIds.has(state.selectedId)
            ? state.selectedId
            : null,
        editingId:
          state.editingId && prevIds.has(state.editingId)
            ? state.editingId
            : null,
        history: {
          past: state.history.past.slice(0, -1),
          present: prev,
          future: [state.history.present, ...state.history.future],
        },
      }
    }),
  redo: () =>
    set((state) => {
      if (state.history.future.length === 0) return state
      const next = state.history.future[0]
      const nextIds = new Set(next.map((shape) => shape.id))
      return {
        selectedId:
          state.selectedId && nextIds.has(state.selectedId)
            ? state.selectedId
            : null,
        editingId:
          state.editingId && nextIds.has(state.editingId)
            ? state.editingId
            : null,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: state.history.future.slice(1),
        },
      }
    }),
}))
