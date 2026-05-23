import type { ComputeStatus } from "@/hooks/useNetworkStore"

export function getStatusText(
  hasImage: boolean,
  nodeCount: number,
  steinerCount: number,
  computeStatus: ComputeStatus,
): string {
  if (!hasImage) return "Ready — upload a map"
  if (computeStatus === "computing") return "Calculating network…"
  if (computeStatus === "error") return "Calculation failed"
  if (nodeCount === 0 && steinerCount === 0) {
    return "Planning — click to place points"
  }
  return `${nodeCount} node${nodeCount === 1 ? "" : "s"} · ${steinerCount} waypoint${steinerCount === 1 ? "" : "s"}`
}
