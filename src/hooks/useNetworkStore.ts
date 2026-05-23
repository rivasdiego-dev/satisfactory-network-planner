import { useCallback, useEffect, useReducer, useRef, useState } from "react"

import { computeRSMT, getComputeMode } from "@/lib/algorithmEngine"
import type { AppState, Point, PointType, RSMTResult, RulerState } from "@/lib/types"
import { createInitialRulerState, getDefaultRulerLength } from "@/lib/types"

export type ComputeStatus = "idle" | "computing" | "error"

type Action =
  | { type: "SET_IMAGE"; dataUrl: string; width: number; height: number }
  | { type: "ADD_POINT"; x: number; y: number }
  | { type: "MOVE_POINT"; id: string; x: number; y: number }
  | { type: "DELETE_POINT"; id: string }
  | { type: "SET_MODE"; mode: PointType }
  | { type: "SET_RESULT"; result: RSMTResult | null }
  | { type: "RESTORE_POINTS"; points: Point[] }
  | { type: "TOGGLE_RULER" }
  | { type: "SET_RULER"; ruler: Partial<RulerState> }
  | { type: "CLEAR_ALL" }
  | { type: "RESET" }

const initialState: AppState = {
  imageDataUrl: null,
  canvasWidth: 800,
  canvasHeight: 600,
  points: [],
  activeMode: "node",
  result: null,
  ruler: createInitialRulerState(),
}

function clonePoints(points: Point[]): Point[] {
  return points.map((p) => ({ ...p }))
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_IMAGE":
      return {
        ...state,
        imageDataUrl: action.dataUrl,
        canvasWidth: action.width,
        canvasHeight: action.height,
        points: [],
        result: null,
        ruler: createInitialRulerState(),
      }

    case "ADD_POINT": {
      const newPoint = {
        id: crypto.randomUUID(),
        x: action.x,
        y: action.y,
        type: state.activeMode,
        isAuto: false,
      }
      return {
        ...state,
        points: [...state.points, newPoint],
      }
    }

    case "MOVE_POINT":
      return {
        ...state,
        points: state.points.map((p) =>
          p.id === action.id ? { ...p, x: action.x, y: action.y } : p,
        ),
      }

    case "DELETE_POINT":
      return {
        ...state,
        points: state.points.filter((p) => p.id !== action.id),
      }

    case "RESTORE_POINTS":
      return {
        ...state,
        points: clonePoints(action.points),
      }

    case "SET_MODE":
      return { ...state, activeMode: action.mode }

    case "SET_RESULT":
      return { ...state, result: action.result }

    case "TOGGLE_RULER": {
      const nextVisible = !state.ruler.visible
      const needsInit = nextVisible && state.ruler.cx === 0 && state.ruler.cy === 0

      return {
        ...state,
        ruler: {
          ...state.ruler,
          visible: nextVisible,
          ...(needsInit
            ? {
                cx: state.canvasWidth / 2,
                cy: state.canvasHeight / 2,
                length: getDefaultRulerLength(state.canvasWidth),
              }
            : {}),
        },
      }
    }

    case "SET_RULER":
      return {
        ...state,
        ruler: { ...state.ruler, ...action.ruler },
      }

    case "CLEAR_ALL":
      return { ...state, points: [], result: null }

    case "RESET":
      return initialState

    default:
      return state
  }
}

export function useNetworkStore() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [computeStatus, setComputeStatus] = useState<ComputeStatus>("idle")
  const [computeError, setComputeError] = useState<string | null>(null)
  const computeGenerationRef = useRef(0)
  const pastRef = useRef<Point[][]>([])
  const futureRef = useRef<Point[][]>([])
  const [historyVersion, setHistoryVersion] = useState(0)

  const syncHistoryFlags = useCallback(() => {
    setHistoryVersion((v) => v + 1)
  }, [])

  const clearHistory = useCallback(() => {
    pastRef.current = []
    futureRef.current = []
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const recordHistory = useCallback(
    (currentPoints: Point[]) => {
      pastRef.current.push(clonePoints(currentPoints))
      futureRef.current = []
      syncHistoryFlags()
    },
    [syncHistoryFlags],
  )

  useEffect(() => {
    if (state.points.length < 2) {
      dispatch({ type: "SET_RESULT", result: null })
      setComputeStatus("idle")
      setComputeError(null)
      return
    }

    const generation = ++computeGenerationRef.current
    setComputeStatus("computing")
    setComputeError(null)

    const pointsSnapshot = state.points
    const timeoutId = window.setTimeout(() => {
      try {
        const result = computeRSMT(pointsSnapshot)
        if (generation !== computeGenerationRef.current) return
        dispatch({ type: "SET_RESULT", result })
        setComputeStatus("idle")
      } catch {
        if (generation !== computeGenerationRef.current) return
        dispatch({ type: "SET_RESULT", result: null })
        setComputeStatus("error")
        setComputeError(
          "Network calculation failed. Try removing some points or clearing the canvas.",
        )
      }
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [state.points])

  const setImage = useCallback(
    (dataUrl: string, width: number, height: number) => {
      clearHistory()
      dispatch({ type: "SET_IMAGE", dataUrl, width, height })
    },
    [clearHistory],
  )

  const addPoint = useCallback(
    (x: number, y: number) => {
      recordHistory(state.points)
      dispatch({ type: "ADD_POINT", x, y })
    },
    [recordHistory, state.points],
  )

  const movePoint = useCallback(
    (id: string, x: number, y: number) => {
      recordHistory(state.points)
      dispatch({ type: "MOVE_POINT", id, x, y })
    },
    [recordHistory, state.points],
  )

  const deletePoint = useCallback(
    (id: string) => {
      recordHistory(state.points)
      dispatch({ type: "DELETE_POINT", id })
    },
    [recordHistory, state.points],
  )

  const setMode = useCallback((mode: PointType) => {
    dispatch({ type: "SET_MODE", mode })
  }, [])

  const toggleRuler = useCallback(() => {
    dispatch({ type: "TOGGLE_RULER" })
  }, [])

  const setRuler = useCallback((ruler: Partial<RulerState>) => {
    dispatch({ type: "SET_RULER", ruler })
  }, [])

  const clearAll = useCallback(() => {
    if (state.points.length > 0) {
      recordHistory(state.points)
    }
    dispatch({ type: "CLEAR_ALL" })
    setComputeStatus("idle")
    setComputeError(null)
  }, [recordHistory, state.points])

  const reset = useCallback(() => {
    clearHistory()
    dispatch({ type: "RESET" })
    setComputeStatus("idle")
    setComputeError(null)
  }, [clearHistory])

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return

    futureRef.current.push(clonePoints(state.points))
    const previous = pastRef.current.pop()
    if (!previous) return

    dispatch({ type: "RESTORE_POINTS", points: previous })
    syncHistoryFlags()
  }, [state.points, syncHistoryFlags])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return

    pastRef.current.push(clonePoints(state.points))
    const next = futureRef.current.pop()
    if (!next) return

    dispatch({ type: "RESTORE_POINTS", points: next })
    syncHistoryFlags()
  }, [state.points, syncHistoryFlags])

  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0
  void historyVersion

  const computeMode = getComputeMode(state.points)

  return {
    state,
    computeStatus,
    computeError,
    computeMode,
    canUndo,
    canRedo,
    setImage,
    addPoint,
    movePoint,
    deletePoint,
    setMode,
    toggleRuler,
    setRuler,
    clearAll,
    reset,
    undo,
    redo,
  }
}
