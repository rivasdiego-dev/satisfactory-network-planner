export function downloadCanvasPng(
  canvas: HTMLCanvasElement,
  filename = "satisfactory-network.png",
): void {
  const link = document.createElement("a")
  link.download = filename
  link.href = canvas.toDataURL("image/png")
  link.click()
}

export async function copyCanvasToClipboard(
  canvas: HTMLCanvasElement,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!navigator.clipboard?.write) {
    return {
      ok: false,
      message: "Clipboard is not available in this browser.",
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve({ ok: false, message: "Could not export canvas image." })
        return
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ])
        resolve({ ok: true })
      } catch {
        resolve({
          ok: false,
          message: "Copy failed. Try downloading the PNG instead.",
        })
      }
    }, "image/png")
  })
}
