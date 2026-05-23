import { useCallback, useState } from "react"

import { getMapCanvasElement } from "@/components/MapCanvas"
import {
  copyCanvasToClipboard,
  downloadCanvasPng,
} from "@/lib/exportCanvas"

export function useCanvasExport() {
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const clearExportMessage = useCallback(() => {
    setExportMessage(null)
  }, [])

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

  return {
    exportMessage,
    handleExportPng,
    handleCopyToClipboard,
    clearExportMessage,
  }
}
