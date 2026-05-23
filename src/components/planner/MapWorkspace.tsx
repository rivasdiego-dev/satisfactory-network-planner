import { MapCanvas } from "@/components/MapCanvas"
import { StatsBar } from "@/components/StatsBar"
import type { ComputeStatus } from "@/hooks/useNetworkStore"
import type { ComputeMode } from "@/lib/algorithmEngine"
import type { AppState, RulerState } from "@/lib/types"

interface MapWorkspaceProps {
  state: AppState
  isComputing: boolean
  nodeCount: number
  steinerCount: number
  computeStatus: ComputeStatus
  computeError: string | null
  computeMode: ComputeMode
  onAdd: (x: number, y: number) => void
  onMove: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
  onRulerChange: (partial: Partial<RulerState>) => void
}

export function MapWorkspace({
  state,
  isComputing,
  nodeCount,
  steinerCount,
  computeStatus,
  computeError,
  computeMode,
  onAdd,
  onMove,
  onDelete,
  onRulerChange,
}: MapWorkspaceProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2 pt-4 md:px-18">
      <StatsBar
        className="absolute right-6 top-4 z-20 md:right-18"
        result={state.result}
        nodeCount={nodeCount}
        manualSteinerCount={steinerCount}
        computeStatus={computeStatus}
        computeError={computeError}
        computeMode={computeMode}
      />
      <div className="flex min-h-0 flex-1 w-full items-center justify-center overflow-hidden py-3 md:py-4">
        <MapCanvas
          state={state}
          isComputing={isComputing}
          onAdd={onAdd}
          onMove={onMove}
          onDelete={onDelete}
          onRulerChange={onRulerChange}
        />
      </div>
    </div>
  )
}
