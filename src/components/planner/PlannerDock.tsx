import {
  BrushCleaning,
  CircuitBoard,
  ClipboardCopy,
  Download,
  FileUp,
  Redo2,
  Ruler,
  Save,
  Share2,
  Undo2,
} from "lucide-react"

import { FloatingDock } from "@/components/ui/floating-dock"
import type { AppState, PointType } from "@/lib/types"

interface PlannerDockProps {
  state: AppState
  exportMessage: string | null
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onToggleRuler: () => void
  onSetMode: (mode: PointType) => void
  onClearAll: () => void
  onNewUpload: () => void
  onExportPng: () => void
  onCopyToClipboard: () => void
}

export function PlannerDock({
  state,
  exportMessage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleRuler,
  onSetMode,
  onClearAll,
  onNewUpload,
  onExportPng,
  onCopyToClipboard,
}: PlannerDockProps) {
  return (
    <div className="relative z-50 flex shrink-0 flex-col items-center gap-2 px-4 pb-4 pt-2">
      {exportMessage && (
        <p className="text-sm text-muted-foreground">{exportMessage}</p>
      )}
      <FloatingDock
        items={[
          {
            title: "Undo (Ctrl+Z)",
            icon: <Undo2 className="text-[#5bb0c5]" />,
            onClick: onUndo,
            disabled: !canUndo,
          },
          {
            title: "Redo (Ctrl+Y)",
            icon: <Redo2 className="text-[#5bb0c5]" />,
            onClick: onRedo,
            disabled: !canRedo,
          },
          { divider: true },
          {
            title: "Ruler",
            icon: <Ruler />,
            onClick: onToggleRuler,
            active: state.ruler.visible,
          },
          {
            title: "Node",
            icon: <Share2 />,
            onClick: () => onSetMode("node"),
            active: state.activeMode === "node",
          },
          {
            title: "Waypoint",
            icon: <CircuitBoard />,
            onClick: () => onSetMode("steiner"),
            active: state.activeMode === "steiner",
          },
          {
            title: "Clear points",
            icon: <BrushCleaning />,
            onClick: onClearAll,
          },
          { divider: true },
          {
            title: "Upload a new file",
            icon: <FileUp className="text-[#caa154]" />,
            onClick: onNewUpload,
          },
          {
            title: "Export PNG",
            icon: <Download className="text-[#caa154]" />,
            onClick: onExportPng,
            disabled: !state.result,
          },
          {
            title: "Copy to clipboard",
            icon: <ClipboardCopy className="text-[#caa154]" />,
            onClick: () => void onCopyToClipboard(),
            disabled: !state.result,
          },
          {
            title: "Save (coming in v2)",
            icon: <Save className="text-[#caa154]" />,
            disabled: true,
          },
        ]}
      />
    </div>
  )
}
