export type PointType = "node" | "steiner"

export interface Point {
  id: string
  x: number
  y: number
  type: PointType
  isAuto: boolean
}

export interface Edge {
  from: Point
  to: Point
}

export interface RSMTResult {
  edges: Edge[]
  autoSteiners: Point[]
  totalManhattanLength: number
}

export interface RulerState {
  visible: boolean
  cx: number
  cy: number
  angle: number
  length: number
}

export const RULER_WIDTH_RATIO = 0.8

export function getDefaultRulerLength(canvasWidth: number): number {
  return canvasWidth * RULER_WIDTH_RATIO
}

export function createInitialRulerState(): RulerState {
  return {
    visible: false,
    cx: 0,
    cy: 0,
    angle: 0,
    length: 0,
  }
}

export interface AppState {
  imageDataUrl: string | null
  canvasWidth: number
  canvasHeight: number
  points: Point[]
  activeMode: PointType
  result: RSMTResult | null
  ruler: RulerState
}
