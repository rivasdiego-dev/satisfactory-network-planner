import { useCallback, useEffect, useRef, useState } from "react"

import {
  applySnap,
  drawRuler,
  drawSnapProjection,
  getRulerHoverTarget,
  hitTestRulerBody,
  hitTestRulerHandle,
  snapRulerAngle,
} from "@/lib/ruler"
import type { AppState, Edge, Point, RulerState } from "@/lib/types"

const NODE_RADIUS = 8
const STEINER_HALF = 7
const AUTO_STEINER_RADIUS = 4
const EDGE_COLOR = "#E24B4A"
const NODE_COLOR = "#378ADD"
const STEINER_COLOR = "#EF9F27"
const HIT_RADIUS = 12

interface MapCanvasProps {
  state: AppState
  isComputing?: boolean
  onAdd: (x: number, y: number) => void
  onMove: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
  onRulerChange: (partial: Partial<RulerState>) => void
}

type RulerDrag =
  | { type: "body"; offsetX: number; offsetY: number }
  | { type: "handle" }

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function hitTest(points: Point[], x: number, y: number): Point | null {
  let closest: Point | null = null
  let closestDist = HIT_RADIUS

  for (const point of points) {
    const d = distance(point, { x, y })
    if (d <= closestDist) {
      closest = point
      closestDist = d
    }
  }

  return closest
}

function drawEdges(ctx: CanvasRenderingContext2D, edges: Edge[]) {
  ctx.strokeStyle = EDGE_COLOR
  ctx.lineWidth = 2
  for (const edge of edges) {
    ctx.beginPath()
    ctx.moveTo(edge.from.x, edge.from.y)
    ctx.lineTo(edge.to.x, edge.to.y)
    ctx.stroke()
  }
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  half: number,
) {
  ctx.beginPath()
  ctx.moveTo(x, y - half)
  ctx.lineTo(x + half, y)
  ctx.lineTo(x, y + half)
  ctx.lineTo(x - half, y)
  ctx.closePath()
}

function drawPoint(ctx: CanvasRenderingContext2D, point: Point) {
  if (point.isAuto) {
    ctx.fillStyle = `${STEINER_COLOR}99`
    ctx.beginPath()
    ctx.arc(point.x, point.y, AUTO_STEINER_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  if (point.type === "steiner") {
    ctx.fillStyle = STEINER_COLOR
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 1.5
    drawDiamond(ctx, point.x, point.y, STEINER_HALF)
    ctx.fill()
    ctx.stroke()
    return
  }

  ctx.fillStyle = "#fff"
  ctx.strokeStyle = NODE_COLOR
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(point.x, point.y, NODE_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = NODE_COLOR
  ctx.beginPath()
  ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
  ctx.fill()
}

function redrawMain(
  ctx: CanvasRenderingContext2D,
  state: AppState,
  image: HTMLImageElement | null,
  dragPosition: { id: string; x: number; y: number } | null,
) {
  ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight)

  if (image) {
    ctx.drawImage(image, 0, 0)
  }

  if (state.result) {
    drawEdges(ctx, state.result.edges)

    for (const point of state.result.autoSteiners) {
      drawPoint(ctx, point)
    }
  }

  for (const point of state.points) {
    if (dragPosition && point.id === dragPosition.id) {
      drawPoint(ctx, { ...point, x: dragPosition.x, y: dragPosition.y })
    } else {
      drawPoint(ctx, point)
    }
  }
}

function redrawOverlay(
  ctx: CanvasRenderingContext2D,
  state: AppState,
  ruler: RulerState,
  snapPreview: { cursor: { x: number; y: number }; projection: { x: number; y: number } } | null,
) {
  ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight)

  if (!ruler.visible) return

  drawRuler(ctx, ruler)

  if (snapPreview) {
    drawSnapProjection(ctx, snapPreview.cursor, snapPreview.projection)
  }
}

function fitContain(
  contentWidth: number,
  contentHeight: number,
  boundsWidth: number,
  boundsHeight: number,
): { width: number; height: number } {
  if (
    contentWidth <= 0 ||
    contentHeight <= 0 ||
    boundsWidth <= 0 ||
    boundsHeight <= 0
  ) {
    return { width: contentWidth, height: contentHeight }
  }

  const scale = Math.min(
    boundsWidth / contentWidth,
    boundsHeight / contentHeight,
  )

  return {
    width: Math.floor(contentWidth * scale),
    height: Math.floor(contentHeight * scale),
  }
}

export function MapCanvas({
  state,
  isComputing = false,
  onAdd,
  onMove,
  onDelete,
  onRulerChange,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const draggingPointRef = useRef<{ id: string; x: number; y: number } | null>(
    null,
  )
  const draggingRulerRef = useRef<RulerDrag | null>(null)
  const liveRulerRef = useRef<RulerState | null>(null)
  const snapPreviewRef = useRef<{
    cursor: { x: number; y: number }
    projection: { x: number; y: number }
  } | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [displaySize, setDisplaySize] = useState<{
    width: number
    height: number
  } | null>(null)
  const [cursorStyle, setCursorStyle] = useState("crosshair")

  const getActiveRuler = useCallback((): RulerState => {
    return liveRulerRef.current ?? state.ruler
  }, [state.ruler])

  const triggerMainRedraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    redrawMain(ctx, state, imageRef.current, draggingPointRef.current)
  }, [state])

  const triggerOverlayRedraw = useCallback(() => {
    const canvas = overlayRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    redrawOverlay(ctx, state, getActiveRuler(), snapPreviewRef.current)
  }, [state, getActiveRuler])

  const triggerRedraw = useCallback(() => {
    triggerMainRedraw()
    triggerOverlayRedraw()
  }, [triggerMainRedraw, triggerOverlayRedraw])

  useEffect(() => {
    if (!state.imageDataUrl) {
      imageRef.current = null
      triggerRedraw()
      return
    }

    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      triggerRedraw()
    }
    img.src = state.imageDataUrl
  }, [state.imageDataUrl, triggerRedraw])

  useEffect(() => {
    triggerRedraw()
  }, [triggerRedraw, state.ruler])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !state.imageDataUrl) {
      setDisplaySize(null)
      return
    }

    const updateDisplaySize = () => {
      const rect = container.getBoundingClientRect()
      const style = getComputedStyle(container)
      const paddingX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      const paddingY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

      setDisplaySize(
        fitContain(
          state.canvasWidth,
          state.canvasHeight,
          rect.width - paddingX,
          rect.height - paddingY,
        ),
      )
    }

    updateDisplaySize()
    const observer = new ResizeObserver(updateDisplaySize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [state.canvasWidth, state.canvasHeight, state.imageDataUrl])

  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = state.canvasWidth / rect.width
      const scaleY = state.canvasHeight / rect.height

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    },
    [state.canvasWidth, state.canvasHeight],
  )

  const updateSnapPreview = useCallback(
    (x: number, y: number, ruler: RulerState) => {
      if (!ruler.visible || draggingRulerRef.current) {
        snapPreviewRef.current = null
        return
      }

      const snap = applySnap({ x, y }, ruler)
      if (snap.snapped) {
        snapPreviewRef.current = { cursor: { x, y }, projection: snap.projection }
      } else {
        snapPreviewRef.current = null
      }
    },
    [],
  )

  const updateHoverCursor = useCallback(
    (x: number, y: number, ruler: RulerState) => {
      if (isComputing) {
        setCursorStyle("wait")
        return
      }
      if (draggingRulerRef.current?.type === "body") {
        setCursorStyle("grabbing")
        return
      }
      if (draggingRulerRef.current?.type === "handle") {
        setCursorStyle("crosshair")
        return
      }
      if (draggingPointRef.current) {
        setCursorStyle("crosshair")
        return
      }

      if (ruler.visible) {
        const hover = getRulerHoverTarget({ x, y }, ruler)
        if (hover === "body") {
          setCursorStyle("grab")
          return
        }
        if (hover === "handle") {
          setCursorStyle("crosshair")
          return
        }
      }

      setCursorStyle("crosshair")
    },
    [isComputing],
  )

  const resolvePlacementPoint = useCallback(
    (x: number, y: number, ruler: RulerState) => {
      if (!ruler.visible || draggingRulerRef.current) return { x, y }
      return applySnap({ x, y }, ruler).point
    },
    [],
  )

  const handlePointerDown = (
    e: React.PointerEvent<HTMLCanvasElement>,
    target: "main" | "overlay",
  ) => {
    if (isComputing) return

    const rulerActive = state.ruler.visible
    if (target === "main" && rulerActive) return

    const { x, y } = toCanvasCoords(e.clientX, e.clientY)
    const ruler = getActiveRuler()
    const captureEl =
      rulerActive && overlayRef.current ? overlayRef.current : canvasRef.current

    if (e.button === 2) {
      const hit = hitTest(state.points, x, y)
      if (hit) onDelete(hit.id)
      return
    }

    if (rulerActive && hitTestRulerHandle({ x, y }, ruler)) {
      draggingRulerRef.current = { type: "handle" }
      liveRulerRef.current = { ...ruler }
      snapPreviewRef.current = null
      captureEl?.setPointerCapture(e.pointerId)
      triggerOverlayRedraw()
      return
    }

    if (rulerActive && hitTestRulerBody({ x, y }, ruler)) {
      draggingRulerRef.current = {
        type: "body",
        offsetX: x - ruler.cx,
        offsetY: y - ruler.cy,
      }
      liveRulerRef.current = { ...ruler }
      snapPreviewRef.current = null
      captureEl?.setPointerCapture(e.pointerId)
      triggerOverlayRedraw()
      return
    }

    const hit = hitTest(state.points, x, y)
    if (hit) {
      draggingPointRef.current = { id: hit.id, x: hit.x, y: hit.y }
      captureEl?.setPointerCapture(e.pointerId)
      triggerMainRedraw()
      return
    }

    const placement = resolvePlacementPoint(x, y, ruler)
    onAdd(placement.x, placement.y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toCanvasCoords(e.clientX, e.clientY)
    const ruler = getActiveRuler()

    if (draggingRulerRef.current?.type === "handle" && liveRulerRef.current) {
      const rawAngle = Math.atan2(
        y - liveRulerRef.current.cy,
        x - liveRulerRef.current.cx,
      )
      liveRulerRef.current = {
        ...liveRulerRef.current,
        angle: snapRulerAngle(rawAngle),
      }
      snapPreviewRef.current = null
      triggerOverlayRedraw()
      updateHoverCursor(x, y, liveRulerRef.current)
      return
    }

    if (draggingRulerRef.current?.type === "body" && liveRulerRef.current) {
      const { offsetX, offsetY } = draggingRulerRef.current
      liveRulerRef.current = {
        ...liveRulerRef.current,
        cx: x - offsetX,
        cy: y - offsetY,
      }
      snapPreviewRef.current = null
      triggerOverlayRedraw()
      updateHoverCursor(x, y, liveRulerRef.current)
      return
    }

    if (draggingPointRef.current) {
      draggingPointRef.current = { ...draggingPointRef.current, x, y }
      triggerMainRedraw()
      updateHoverCursor(x, y, ruler)
      return
    }

    updateSnapPreview(x, y, ruler)
    updateHoverCursor(x, y, ruler)
    triggerOverlayRedraw()
  }

  const handlePointerUp = () => {
    if (draggingRulerRef.current && liveRulerRef.current) {
      onRulerChange({
        cx: liveRulerRef.current.cx,
        cy: liveRulerRef.current.cy,
        angle: liveRulerRef.current.angle,
      })
      draggingRulerRef.current = null
      liveRulerRef.current = null
      triggerOverlayRedraw()
      return
    }

    if (!draggingPointRef.current) return
    const { id, x, y } = draggingPointRef.current
    draggingPointRef.current = null
    onMove(id, x, y)
  }

  if (!state.imageDataUrl) {
    return (
      <div className="flex h-full min-h-48 w-full items-center justify-center rounded-md border border-dashed border-border/60 bg-background/40 p-8 text-center text-muted-foreground">
        Upload a map screenshot to start planning your network.
      </div>
    )
  }

  const rulerVisible = state.ruler.visible

  return (
    <div
      ref={containerRef}
      className="map-glass-frame relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-3 md:p-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl border border-white/15 bg-background/25 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/5 dark:via-white/[0.02] dark:to-transparent"
      />
      {state.imageDataUrl.startsWith("data:image/png") && (
        <div
          aria-hidden
          className="map-transparency-grid pointer-events-none absolute inset-3 rounded-xl opacity-30"
        />
      )}
      {displaySize && (
        <div
          className="relative shrink-0"
          style={{
            width: displaySize.width,
            height: displaySize.height,
          }}
        >
          <canvas
            ref={canvasRef}
            data-map-canvas
            width={state.canvasWidth}
            height={state.canvasHeight}
            onPointerDown={(e) => handlePointerDown(e, "main")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            className={`relative z-10 block h-full w-full rounded-lg shadow-lg ring-1 ring-white/10 ${isComputing ? "opacity-90" : ""
              } ${rulerVisible ? "pointer-events-none" : ""}`}
            style={{ cursor: rulerVisible ? undefined : cursorStyle }}
          />
          <canvas
            ref={overlayRef}
            width={state.canvasWidth}
            height={state.canvasHeight}
            onPointerDown={(e) => handlePointerDown(e, "overlay")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            className={`absolute inset-0 z-20 h-full w-full rounded-lg ${rulerVisible ? "" : "pointer-events-none"
              }`}
            style={{ cursor: rulerVisible ? cursorStyle : undefined }}
          />
        </div>
      )}
      {isComputing && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center pt-6">
          <div className="rounded-md border border-border/60 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground shadow-lg backdrop-blur-sm">
            Calculating network…
          </div>
        </div>
      )}
    </div>
  )
}

export function getMapCanvasElement(): HTMLCanvasElement | null {
  return document.querySelector("[data-map-canvas]")
}
