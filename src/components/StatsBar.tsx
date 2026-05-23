import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ComputeStatus } from "@/hooks/useNetworkStore"
import type { ComputeMode } from "@/lib/algorithmEngine"
import type { RSMTResult } from "@/lib/types"

interface StatsBarProps {
  result: RSMTResult | null
  nodeCount: number
  manualSteinerCount: number
  computeStatus: ComputeStatus
  computeError: string | null
  computeMode: ComputeMode
  className?: string
}

export function StatsBar({
  result,
  nodeCount,
  manualSteinerCount,
  computeStatus,
  computeError,
  computeMode,
  className,
}: StatsBarProps) {
  const autoSteinerCount = result?.autoSteiners.length ?? 0
  const totalSteinerCount = manualSteinerCount + autoSteinerCount

  const totalLength =
    computeStatus === "computing"
      ? "…"
      : result
        ? `${Math.round(result.totalManhattanLength)}u`
        : "—"

  return (
    <Card
      size="sm"
      className={cn(
        "pointer-events-none w-56 gap-3 border-border/60 bg-background/80 py-4 shadow-lg backdrop-blur-md",
        computeStatus === "error" && "border-destructive/50",
        className,
      )}
    >
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-xs font-normal tracking-[0.2em] text-muted-foreground">
          Network Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        {computeStatus === "computing" && (
          <p className="text-xs text-muted-foreground">Calculating network…</p>
        )}

        {computeStatus === "error" && computeError && (
          <p className="text-xs text-destructive" role="alert">
            {computeError}
          </p>
        )}

        {computeMode === "fast" && computeStatus !== "error" && (
          <p className="text-xs text-muted-foreground">
            Fast mode — many points skip auto-junction search.
          </p>
        )}

        <p className="font-heading text-base font-semibold text-primary">
          Total Length: {totalLength}
        </p>
        <div className="space-y-1.5 text-sm">
          <StatRow color="#22c55e" label="Nodes" value={String(nodeCount)} />
          <StatRow
            color="#EF9F27"
            label="Steiner pts"
            value={String(totalSteinerCount)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function StatRow({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}:
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
