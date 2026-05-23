import type { RulerState } from "./types"

const RULER_COLOR = "#FA9549"
const TICK_COLOR = "#D67A31"
const HANDLE_RADIUS = 6
const BODY_HIT_THRESHOLD = 8
const SNAP_THRESHOLD = 12
const ANGLE_SNAP_STEP = Math.PI / 4
const ANGLE_SNAP_THRESHOLD = Math.PI / 180

function normalizeAngle(angleRadians: number): number {
  let angle = angleRadians
  while (angle <= -Math.PI) angle += 2 * Math.PI
  while (angle > Math.PI) angle -= 2 * Math.PI
  return angle
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a - b))
  return Math.min(diff, 2 * Math.PI - diff)
}

/** Free rotation with magnetic snap when within ~1° of a 45° increment. */
export function snapRulerAngle(angleRadians: number): number {
  const angle = normalizeAngle(angleRadians)
  const snapped = normalizeAngle(
    Math.round(angle / ANGLE_SNAP_STEP) * ANGLE_SNAP_STEP,
  )

  if (angularDistance(angle, snapped) <= ANGLE_SNAP_THRESHOLD) {
    return snapped
  }

  return angle
}

export type Vec2 = { x: number; y: number }

export function getRulerEndpoints(ruler: RulerState): {
  start: Vec2
  end: Vec2
  handle: Vec2
} {
  const half = ruler.length / 2
  const dx = Math.cos(ruler.angle)
  const dy = Math.sin(ruler.angle)

  const end = {
    x: ruler.cx + dx * half,
    y: ruler.cy + dy * half,
  }
  const start = {
    x: ruler.cx - dx * half,
    y: ruler.cy - dy * half,
  }

  return { start, end, handle: end }
}

export function projectOntoRuler(cursor: Vec2, ruler: RulerState): Vec2 {
  const dx = Math.cos(ruler.angle)
  const dy = Math.sin(ruler.angle)
  const t = (cursor.x - ruler.cx) * dx + (cursor.y - ruler.cy) * dy
  return { x: ruler.cx + t * dx, y: ruler.cy + t * dy }
}

export function distToRuler(cursor: Vec2, ruler: RulerState): number {
  const proj = projectOntoRuler(cursor, ruler)
  return Math.hypot(cursor.x - proj.x, cursor.y - proj.y)
}

function distToSegment(
  point: Vec2,
  a: Vec2,
  b: Vec2,
): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const lenSq = abx * abx + aby * aby
  if (lenSq === 0) return Math.hypot(point.x - a.x, point.y - a.y)

  let t = ((point.x - a.x) * abx + (point.y - a.y) * aby) / lenSq
  t = Math.max(0, Math.min(1, t))

  const projX = a.x + t * abx
  const projY = a.y + t * aby
  return Math.hypot(point.x - projX, point.y - projY)
}

export function hitTestRulerHandle(cursor: Vec2, ruler: RulerState): boolean {
  const { handle } = getRulerEndpoints(ruler)
  return Math.hypot(cursor.x - handle.x, cursor.y - handle.y) <= HANDLE_RADIUS + 4
}

export function hitTestRulerBody(cursor: Vec2, ruler: RulerState): boolean {
  if (hitTestRulerHandle(cursor, ruler)) return false
  const { start, end } = getRulerEndpoints(ruler)
  return distToSegment(cursor, start, end) <= BODY_HIT_THRESHOLD
}

export function applySnap(
  cursor: Vec2,
  ruler: RulerState,
  threshold = SNAP_THRESHOLD,
): { snapped: boolean; point: Vec2; projection: Vec2 } {
  const projection = projectOntoRuler(cursor, ruler)
  const dist = Math.hypot(cursor.x - projection.x, cursor.y - projection.y)
  if (dist < threshold) {
    return { snapped: true, point: projection, projection }
  }
  return { snapped: false, point: cursor, projection }
}

export function getRulerHoverTarget(
  cursor: Vec2,
  ruler: RulerState,
): "handle" | "body" | null {
  if (hitTestRulerHandle(cursor, ruler)) return "handle"
  if (hitTestRulerBody(cursor, ruler)) return "body"
  return null
}

export function drawSnapProjection(
  ctx: CanvasRenderingContext2D,
  cursor: Vec2,
  projection: Vec2,
) {
  ctx.save()
  ctx.strokeStyle = `${RULER_COLOR}80`
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cursor.x, cursor.y)
  ctx.lineTo(projection.x, projection.y)
  ctx.stroke()
  ctx.restore()
}

export function drawRuler(ctx: CanvasRenderingContext2D, ruler: RulerState) {
  const { start, end, handle } = getRulerEndpoints(ruler)
  const dx = Math.cos(ruler.angle)
  const dy = Math.sin(ruler.angle)

  ctx.save()

  ctx.strokeStyle = RULER_COLOR
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()

  const tickCount = Math.floor(ruler.length / 20)
  const perpX = -dy
  const perpY = dx

  for (let i = 0; i <= tickCount; i++) {
    const offset = -ruler.length / 2 + i * 20
    const tx = ruler.cx + dx * offset
    const ty = ruler.cy + dy * offset
    const major = i % 5 === 0
    const tickLen = major ? 10 : 6

    ctx.strokeStyle = TICK_COLOR
    ctx.lineWidth = major ? 1.5 : 1
    ctx.beginPath()
    ctx.moveTo(tx - perpX * tickLen, ty - perpY * tickLen)
    ctx.lineTo(tx + perpX * tickLen, ty + perpY * tickLen)
    ctx.stroke()
  }

  ctx.fillStyle = RULER_COLOR
  ctx.strokeStyle = "#fff"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(handle.x, handle.y, HANDLE_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

export { SNAP_THRESHOLD }
