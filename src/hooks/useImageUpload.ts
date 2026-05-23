import { useCallback, useState } from "react"

import { loadImageFromFile } from "@/lib/loadImageFromFile"

export function useImageUpload(
  setImage: (dataUrl: string, width: number, height: number) => void,
) {
  const [uploadError, setUploadError] = useState<string | null>(null)

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

  return { uploadError, handleFileUpload }
}
