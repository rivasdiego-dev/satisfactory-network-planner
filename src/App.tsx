import {
  BrushCleaning,
  CircuitBoard,
  ClipboardCopy,
  Download,
  FileUp,
  InfoIcon,
  Redo2,
  Ruler,
  Save,
  Share2,
  Undo2,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { MapCanvas, getMapCanvasElement } from "./components/MapCanvas"
import LightPillar from "./components/LightPillar"
import { StatsBar } from "./components/StatsBar"
import FileUpload from "./components/ui/file-upload"
import { FloatingDock } from "./components/ui/floating-dock"
import { useNetworkStore } from "./hooks/useNetworkStore"
import {
  copyCanvasToClipboard,
  downloadCanvasPng,
} from "./lib/exportCanvas"

function loadImageFromFile(
  file: File,
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl !== "string") {
        reject(new Error("Could not read file."))
        return
      }

      const img = new Image()
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }
      img.onerror = () => reject(new Error("Could not load image."))
      img.src = dataUrl
    }

    reader.onerror = () => reject(new Error("Could not read file."))
    reader.readAsDataURL(file)
  })
}

function getStatusText(
  hasImage: boolean,
  nodeCount: number,
  steinerCount: number,
  computeStatus: "idle" | "computing" | "error",
): string {
  if (!hasImage) return "Upload a map"
  if (computeStatus === "computing") return "Calculating network…"
  if (computeStatus === "error") return "Calculation failed"
  if (nodeCount === 0 && steinerCount === 0) return "Planning — click to place points"
  return `${nodeCount} node${nodeCount === 1 ? "" : "s"} · ${steinerCount} waypoint${steinerCount === 1 ? "" : "s"}`
}

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

  const [uploadError, setUploadError] = useState<string | null>(null)
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const nodeCount = state.points.filter((p) => p.type === "node").length
  const steinerCount = state.points.filter((p) => p.type === "steiner").length

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return

      try {
        const { dataUrl, width, height } = await loadImageFromFile(file)
        setImage(dataUrl, width, height)
        setUploadError(null)
      } catch {
        setUploadError("Could not load that image. Try another screenshot.")
      }
    },
    [setImage],
  )

  const handleNewUpload = useCallback(() => {
    reset()
    setExportMessage(null)
  }, [reset])

  const handleExportPng = useCallback(() => {
    const canvas = getMapCanvasElement()
    if (!canvas) return
    downloadCanvasPng(canvas)
    setExportMessage(null)
  }, [])

  const handleCopyToClipboard = useCallback(async () => {
    const canvas = getMapCanvasElement()
    if (!canvas) return

    const result = await copyCanvasToClipboard(canvas)
    if (result.ok) {
      setExportMessage("Copied to clipboard.")
    } else {
      setExportMessage(result.message)
    }
  }, [])

  const hasImage = Boolean(state.imageDataUrl)

  useEffect(() => {
    if (!hasImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA")
      ) {
        return
      }

      if (event.key === "z" || event.key === "Z") {
        event.preventDefault()
        undo()
        return
      }

      if (event.key === "y" || event.key === "Y") {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasImage, undo, redo])

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <LightPillar
          topColor="#A855F7"
          bottomColor="#7C3AED"
          intensity={1}
          rotationSpeed={0.5}
          interactive={false}
          glowAmount={0.003}
          pillarWidth={2.5}
          pillarHeight={0.2}
          noiseIntensity={0.1}
          pillarRotation={90}
        />
      </div>


      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 gap-3 bg-accent p-4">
          <p className="text-3xl tracking-tight text-primary uppercase">
            Ficsit Network Planner
          </p>
          <div className="flex items-center gap-2 border-l px-4">
            <InfoIcon size={16} className="text-blue-200" />
            <p>{getStatusText(hasImage, nodeCount, steinerCount, computeStatus)}</p>
          </div>
        </header>

        {hasImage ? (
          <div className="flex min-h-0 flex-1 flex-col">
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
              <div className="flex min-h-0 flex-1 w-full items-center justify-center overflow-hidden">
                <MapCanvas
                  state={state}
                  isComputing={computeStatus === "computing"}
                  onAdd={addPoint}
                  onMove={movePoint}
                  onDelete={deletePoint}
                  onRulerChange={setRuler}
                />
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 px-4 pb-4 pt-2">
              {exportMessage && (
                <p className="text-sm text-muted-foreground">{exportMessage}</p>
              )}
              <FloatingDock
                items={[
                  {
                    title: "Undo (Ctrl+Z)",
                    icon: <Undo2 className="text-sky-300" />,
                    onClick: undo,
                    disabled: !canUndo,
                  },
                  {
                    title: "Redo (Ctrl+Y)",
                    icon: <Redo2 className="text-sky-300" />,
                    onClick: redo,
                    disabled: !canRedo,
                  },
                  { divider: true },
                  {
                    title: "Ruler",
                    icon: <Ruler className="text-amber-300" />,
                    onClick: toggleRuler,
                    active: state.ruler.visible,
                  },
                  {
                    title: "Node",
                    icon: <Share2 className="text-lime-300" />,
                    onClick: () => setMode("node"),
                    active: state.activeMode === "node",
                  },
                  {
                    title: "Waypoint",
                    icon: <CircuitBoard className="text-green-300" />,
                    onClick: () => setMode("steiner"),
                    active: state.activeMode === "steiner",
                  },
                  {
                    title: "Clear points",
                    icon: <BrushCleaning className="text-red-300" />,
                    onClick: clearAll,
                  },
                  { divider: true },
                  {
                    title: "Upload a new file",
                    icon: <FileUp className="text-bg-foreground" />,
                    onClick: handleNewUpload,
                  },
                  {
                    title: "Export PNG",
                    icon: <Download className="text-bg-foreground" />,
                    onClick: handleExportPng,
                    disabled: !state.result,
                  },
                  {
                    title: "Copy to clipboard",
                    icon: <ClipboardCopy className="text-bg-foreground" />,
                    onClick: () => void handleCopyToClipboard(),
                    disabled: !state.result,
                  },
                  {
                    title: "Save (coming in v2)",
                    icon: <Save className="text-bg-foreground" />,
                    disabled: true,
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 md:px-18">
            <div className="w-full max-w-2xl gap-4">
              <FileUpload
                allowedExtensions={["png", "jpg", "jpeg", "webp"]}
                onChange={(files) => void handleFileUpload(files)}
              />
              {uploadError && (
                <p className="mt-3 text-center text-sm text-destructive" role="alert">
                  {uploadError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default App
