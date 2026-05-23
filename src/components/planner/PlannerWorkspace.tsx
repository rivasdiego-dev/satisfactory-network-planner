import type { ComputeStatus } from "@/hooks/useNetworkStore"
import type { ComputeMode } from "@/lib/algorithmEngine"
import type { AppState, PointType, RulerState } from "@/lib/types"

import { MapWorkspace } from "./MapWorkspace"
import { PlannerDock } from "./PlannerDock"

interface PlannerWorkspaceProps {
  state: AppState
  isComputing: boolean
  nodeCount: number
  steinerCount: number
  computeStatus: ComputeStatus
  computeError: string | null
  computeMode: ComputeMode
  exportMessage: string | null
  canUndo: boolean
  canRedo: boolean
  onAdd: (x: number, y: number) => void
  onMove: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
  onRulerChange: (partial: Partial<RulerState>) => void
  onUndo: () => void
  onRedo: () => void
  onToggleRuler: () => void
  onSetMode: (mode: PointType) => void
  onClearAll: () => void
  onNewUpload: () => void
  onExportPng: () => void
  onCopyToClipboard: () => void
}

export function PlannerWorkspace({
  state,
  isComputing,
  nodeCount,
  steinerCount,
  computeStatus,
  computeError,
  computeMode,
  exportMessage,
  canUndo,
  canRedo,
  onAdd,
  onMove,
  onDelete,
  onRulerChange,
  onUndo,
  onRedo,
  onToggleRuler,
  onSetMode,
  onClearAll,
  onNewUpload,
  onExportPng,
  onCopyToClipboard,
}: PlannerWorkspaceProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MapWorkspace
        state={state}
        isComputing={isComputing}
        nodeCount={nodeCount}
        steinerCount={steinerCount}
        computeStatus={computeStatus}
        computeError={computeError}
        computeMode={computeMode}
        onAdd={onAdd}
        onMove={onMove}
        onDelete={onDelete}
        onRulerChange={onRulerChange}
      />
      <PlannerDock
        state={state}
        exportMessage={exportMessage}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onToggleRuler={onToggleRuler}
        onSetMode={onSetMode}
        onClearAll={onClearAll}
        onNewUpload={onNewUpload}
        onExportPng={onExportPng}
        onCopyToClipboard={onCopyToClipboard}
      />
    </div>
  )
}
