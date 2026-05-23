import { useCallback } from "react"

import { AboutDialog } from "@/components/AboutDialog"
import {
  AppBackground,
  AppHeader,
  PlannerWorkspace,
  UploadScreen,
} from "@/components/planner"
import { useCanvasExport } from "@/hooks/useCanvasExport"
import { useFirstVisitDialog } from "@/hooks/useFirstVisitDialog"
import { useImageUpload } from "@/hooks/useImageUpload"
import { useNetworkStore } from "@/hooks/useNetworkStore"
import { useUndoRedoKeyboard } from "@/hooks/useUndoRedoKeyboard"
import { getStatusText } from "@/lib/plannerStatus"

export function App() {
  const {
    state,
    computeStatus,
    computeError,
    computeMode,
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
    canUndo,
    canRedo,
  } = useNetworkStore()

  const {
    open: aboutOpen,
    onOpenChange: onAboutOpenChange,
    openDialog: openAboutDialog,
    suppressAutoOpen,
  } = useFirstVisitDialog()

  const { uploadError, handleFileUpload } = useImageUpload(setImage)
  const {
    exportMessage,
    handleExportPng,
    handleCopyToClipboard,
    clearExportMessage,
  } = useCanvasExport()

  const hasImage = Boolean(state.imageDataUrl)
  const nodeCount = state.points.filter((p) => p.type === "node").length
  const steinerCount = state.points.filter((p) => p.type === "steiner").length

  useUndoRedoKeyboard({ enabled: hasImage, undo, redo })

  const handleNewUpload = useCallback(() => {
    reset()
    clearExportMessage()
  }, [reset, clearExportMessage])

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      <AboutDialog
        open={aboutOpen}
        onOpenChange={onAboutOpenChange}
        suppressAutoOpen={suppressAutoOpen}
      />

      <AppBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AppHeader
          statusText={getStatusText(
            hasImage,
            nodeCount,
            steinerCount,
            computeStatus,
          )}
          onAboutClick={openAboutDialog}
        />

        {hasImage ? (
          <PlannerWorkspace
            state={state}
            isComputing={computeStatus === "computing"}
            nodeCount={nodeCount}
            steinerCount={steinerCount}
            computeStatus={computeStatus}
            computeError={computeError}
            computeMode={computeMode}
            exportMessage={exportMessage}
            canUndo={canUndo}
            canRedo={canRedo}
            onAdd={addPoint}
            onMove={movePoint}
            onDelete={deletePoint}
            onRulerChange={setRuler}
            onUndo={undo}
            onRedo={redo}
            onToggleRuler={toggleRuler}
            onSetMode={setMode}
            onClearAll={clearAll}
            onNewUpload={handleNewUpload}
            onExportPng={handleExportPng}
            onCopyToClipboard={handleCopyToClipboard}
          />
        ) : (
          <UploadScreen onUpload={handleFileUpload} error={uploadError} />
        )}
      </div>
    </main>
  )
}

export default App
