export function loadImageFromFile(
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
