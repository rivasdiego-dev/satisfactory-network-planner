import { IconFileUpload } from "@tabler/icons-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"

type Props = {
  onChange: (files: File[]) => void
  allowedExtensions: string[]
}

function isAllowedImage(file: File, allowedExtensions: string[]): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (allowedExtensions.includes(ext)) return true

  const mime = file.type.toLowerCase()
  if (mime === "image/png" && allowedExtensions.includes("png")) return true
  if (
    mime === "image/jpeg" &&
    (allowedExtensions.includes("jpg") || allowedExtensions.includes("jpeg"))
  ) {
    return true
  }
  if (mime === "image/webp" && allowedExtensions.includes("webp")) return true

  return false
}

function filterAllowed(files: File[], allowedExtensions: string[]): File[] {
  return files.filter((file) => isAllowedImage(file, allowedExtensions))
}

function fileFromClipboardItem(item: DataTransferItem): File | null {
  if (!item.type.startsWith("image/")) return null

  const file = item.getAsFile()
  if (!file) return null

  if (file.name) return file

  const subtype = item.type.split("/")[1] ?? "png"
  const ext = subtype === "jpeg" ? "jpg" : subtype
  return new File([file], `screenshot.${ext}`, { type: file.type })
}

export default function FileUpload({ onChange, allowedExtensions }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        setError("No file selected.")
        return
      }

      const allowed = filterAllowed(files, allowedExtensions)
      if (allowed.length === 0) {
        setError(
          `Unsupported file type. Allowed: ${allowedExtensions.join(", ")}`,
        )
        return
      }

      setError(null)
      onChange(allowed)
    },
    [allowedExtensions, onChange],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleFiles(acceptedFiles)
    },
    [handleFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(
      allowedExtensions.map((ext) => [`.${ext}`, [] as string[]]),
    ),
    multiple: false,
    noClick: true,
    noKeyboard: true,
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    handleFiles(Array.from(files))
    event.target.value = ""
  }

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (const item of items) {
        const file = fileFromClipboardItem(item)
        if (!file) continue

        event.preventDefault()
        handleFiles([file])
        return
      }

      const hasNonImage = [...items].some(
        (item) => item.kind === "file" && !item.type.startsWith("image/"),
      )
      if (hasNonImage) {
        setError("Clipboard does not contain a supported image.")
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handleFiles])

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-4 backdrop-blur-sm ${
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-border/60 bg-background/50"
      }`}
    >
      <input {...getInputProps()} />
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        accept={allowedExtensions.map((ext) => `.${ext}`).join(",")}
        className="hidden"
      />

      <IconFileUpload size={64} stroke={1} className="mr-2 text-primary-300" />
      <p className="font-heading text-xl">
        {isDragActive
          ? "Drop your map screenshot here"
          : "Drop your map screenshot here"}
      </p>
      <p>or paste with Ctrl+V</p>
      <button
        type="button"
        className="cursor-pointer rounded-lg border border-primary-300 px-4 py-2 font-heading tracking-wider text-primary-300"
        onClick={() => inputRef.current?.click()}
      >
        Select a file
      </button>
      <span className="text-sm text-muted-foreground">
        {allowedExtensions.join(", ")}
      </span>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
