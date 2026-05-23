import type { Edge, Point, RSMTResult } from "./types"

/** Hanan grid beyond this uses fast MST-only path (avoids combinatorial explosion). */
const MAX_CANDIDATES_FOR_STEINER_SEARCH = 12
const MAX_STEINER_SUBSET_SIZE = 6
const MAX_SUBSET_ITERATIONS = 2500

function createPoint(
  x: number,
  y: number,
  type: Point["type"],
  isAuto: boolean,
): Point {
  return { id: crypto.randomUUID(), x, y, type, isAuto }
}

function manhattanDist(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function generateCandidateSteiners(inputPoints: Point[]): Point[] {
  const xs = [...new Set(inputPoints.map((p) => p.x))]
  const ys = [...new Set(inputPoints.map((p) => p.y))]
  const candidates: Point[] = []

  for (const x of xs) {
    for (const y of ys) {
      const exists = inputPoints.some((p) => p.x === x && p.y === y)
      if (!exists) {
        candidates.push(createPoint(x, y, "steiner", true))
      }
    }
  }

  return candidates
}

function primMST(allPoints: Point[]): { edges: Edge[]; totalLen: number } {
  const n = allPoints.length
  if (n === 0) return { edges: [], totalLen: 0 }

  const inTree = new Array<boolean>(n).fill(false)
  const minDist = new Array<number>(n).fill(Infinity)
  const parent = new Array<number>(n).fill(-1)
  minDist[0] = 0

  const edges: Edge[] = []
  let total = 0

  for (let step = 0; step < n; step++) {
    let u = -1
    let best = Infinity
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && minDist[i] < best) {
        best = minDist[i]
        u = i
      }
    }

    if (u === -1) break

    inTree[u] = true

    if (parent[u] !== -1) {
      edges.push({ from: allPoints[parent[u]], to: allPoints[u] })
      total += manhattanDist(allPoints[parent[u]], allPoints[u])
    }

    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue
      const d = manhattanDist(allPoints[u], allPoints[v])
      if (d < minDist[v]) {
        minDist[v] = d
        parent[v] = u
      }
    }
  }

  return { edges, totalLen: total }
}

function edgeContainsPoint(edge: Edge, pointId: string): boolean {
  return edge.from.id === pointId || edge.to.id === pointId
}

function pruneAutoSteiners(edges: Edge[], autoSteiners: Point[]): Edge[] {
  const pruned = [...edges]
  const autoIds = new Set(autoSteiners.map((p) => p.id))

  let changed = true
  while (changed) {
    changed = false
    const degree = new Map<string, number>()

    for (const edge of pruned) {
      degree.set(edge.from.id, (degree.get(edge.from.id) ?? 0) + 1)
      degree.set(edge.to.id, (degree.get(edge.to.id) ?? 0) + 1)
    }

    for (const steiner of autoSteiners) {
      if (!autoIds.has(steiner.id)) continue
      if ((degree.get(steiner.id) ?? 0) !== 1) continue

      const idx = pruned.findIndex((e) => edgeContainsPoint(e, steiner.id))
      if (idx !== -1) {
        pruned.splice(idx, 1)
        changed = true
      }
    }
  }

  return pruned
}

function rectifyEdges(edges: Edge[]): { segments: Edge[]; bendPoints: Point[] } {
  const segments: Edge[] = []
  const bendPoints: Point[] = []

  for (const edge of edges) {
    const { from, to } = edge

    if (from.x === to.x || from.y === to.y) {
      segments.push({ from, to })
      continue
    }

    const bend = createPoint(to.x, from.y, "steiner", true)
    segments.push({ from, to: bend })
    segments.push({ from: bend, to })
    bendPoints.push(bend)
  }

  return { segments, bendPoints }
}

function pointUsedInEdges(pointId: string, edges: Edge[]): boolean {
  return edges.some((e) => edgeContainsPoint(e, pointId))
}

function buildResultFromConfig(config: Point[]): RSMTResult {
  const { edges } = primMST(config)

  const usedAutoSteiners = config.filter(
    (p) => p.isAuto && pointUsedInEdges(p.id, edges),
  )

  const prunedEdges = pruneAutoSteiners(edges, usedAutoSteiners)
  const { segments, bendPoints } = rectifyEdges(prunedEdges)

  const realTotal = segments.reduce(
    (sum, seg) => sum + manhattanDist(seg.from, seg.to),
    0,
  )

  return {
    edges: segments,
    autoSteiners: [...usedAutoSteiners, ...bendPoints],
    totalManhattanLength: realTotal,
  }
}

function findBestConfig(
  baseConfig: Point[],
  candidates: Point[],
): Point[] {
  if (candidates.length === 0) return baseConfig

  const maxSubsetSize = Math.min(candidates.length, MAX_STEINER_SUBSET_SIZE)
  let bestLen = Infinity
  let bestConfig = baseConfig
  let iterations = 0

  function search(start: number, current: Point[]) {
    if (iterations++ > MAX_SUBSET_ITERATIONS) return

    const config = [...baseConfig, ...current]
    const { totalLen } = primMST(config)
    if (totalLen < bestLen) {
      bestLen = totalLen
      bestConfig = config
    }

    if (current.length >= maxSubsetSize) return

    for (let i = start; i < candidates.length; i++) {
      search(i + 1, [...current, candidates[i]])
      if (iterations > MAX_SUBSET_ITERATIONS) return
    }
  }

  search(0, [])
  return bestConfig
}

export type ComputeMode = "full" | "fast"

export function estimateCandidateCount(points: Point[]): number {
  const xs = new Set(points.map((p) => p.x)).size
  const ys = new Set(points.map((p) => p.y)).size
  return Math.max(0, xs * ys - points.length)
}

export function getComputeMode(points: Point[]): ComputeMode {
  return estimateCandidateCount(points) <= MAX_CANDIDATES_FOR_STEINER_SEARCH
    ? "full"
    : "fast"
}

export function computeRSMT(inputPoints: Point[]): RSMTResult {
  if (inputPoints.length < 2) {
    return { edges: [], autoSteiners: [], totalManhattanLength: 0 }
  }

  const terminals = inputPoints.filter((p) => p.type === "node")
  const manualSteiners = inputPoints.filter(
    (p) => p.type === "steiner" && !p.isAuto,
  )
  const baseConfig = [...terminals, ...manualSteiners]
  const candidates = generateCandidateSteiners(inputPoints)

  const bestConfig =
    candidates.length <= MAX_CANDIDATES_FOR_STEINER_SEARCH
      ? findBestConfig(baseConfig, candidates)
      : baseConfig

  return buildResultFromConfig(bestConfig)
}
